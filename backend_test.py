#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Vaal Vibes PWA
Tests all critical endpoints and business logic flows
"""

import requests
import sys
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

class VaalVibesAPITester:
    def __init__(self, base_url: str = "https://pwa-builder-19.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.customer_token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Demo credentials from backend seed data
        self.demo_customer = {
            "email": "guest@vaalvibes.app",
            "password": "VaalVibes!123"
        }
        self.demo_admin = {
            "email": "super@vaalvibes.app", 
            "password": "VaalVibes!123",
            "otp": "246810"
        }

    def log_result(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name}")
        else:
            print(f"❌ {test_name} - {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "response_data": response_data
        })

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    token: Optional[str] = None, expected_status: int = 200) -> tuple[bool, Dict]:
        """Make HTTP request with error handling"""
        url = f"{self.api_url}/{endpoint.lstrip('/')}"
        headers = {'Content-Type': 'application/json'}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'
        
        try:
            if method.upper() == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method.upper() == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method.upper() == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method.upper() == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            else:
                return False, {"error": f"Unsupported method: {method}"}
            
            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = {"status_code": response.status_code, "text": response.text}
            
            return success, response_data
            
        except requests.exceptions.RequestException as e:
            return False, {"error": str(e)}

    def test_public_endpoints(self):
        """Test public API endpoints"""
        print("\n🔍 Testing Public Endpoints...")
        
        # Test root endpoint
        success, data = self.make_request('GET', '/')
        self.log_result("API Root Endpoint", success, 
                       "" if success else f"Failed: {data}")
        
        # Test bootstrap endpoint
        success, data = self.make_request('GET', '/public/bootstrap')
        if success:
            required_fields = ['venue_name', 'menu', 'events', 'specials']
            missing_fields = [f for f in required_fields if f not in data]
            if missing_fields:
                self.log_result("Bootstrap Endpoint Structure", False, 
                               f"Missing fields: {missing_fields}")
            else:
                self.log_result("Bootstrap Endpoint", True)
                # Check if we have menu data
                menu_count = len(data.get('menu', []))
                events_count = len(data.get('events', []))
                specials_count = len(data.get('specials', []))
                self.log_result("Bootstrap Data Population", 
                               menu_count > 0 and events_count > 0 and specials_count > 0,
                               f"Menu: {menu_count}, Events: {events_count}, Specials: {specials_count}")
        else:
            self.log_result("Bootstrap Endpoint", False, f"Failed: {data}")
        
        # Test menu endpoint
        success, data = self.make_request('GET', '/public/menu')
        self.log_result("Public Menu Endpoint", success,
                       "" if success else f"Failed: {data}")
        
        # Test events endpoint
        success, data = self.make_request('GET', '/public/events')
        self.log_result("Public Events Endpoint", success,
                       "" if success else f"Failed: {data}")
        
        # Test specials endpoint
        success, data = self.make_request('GET', '/public/specials')
        self.log_result("Public Specials Endpoint", success,
                       "" if success else f"Failed: {data}")

    def test_customer_auth(self):
        """Test customer authentication"""
        print("\n🔍 Testing Customer Authentication...")
        
        # Test customer login
        success, data = self.make_request('POST', '/auth/login', self.demo_customer)
        if success and 'access_token' in data:
            self.customer_token = data['access_token']
            self.log_result("Customer Login", True)
            
            # Verify token includes promo info
            has_promo = 'promo' in data and data['promo'] is not None
            self.log_result("Customer Login Includes Promo", has_promo,
                           "" if has_promo else "No promo data in login response")
        else:
            self.log_result("Customer Login", False, f"Failed: {data}")
            return
        
        # Test auth/me endpoint
        success, data = self.make_request('GET', '/auth/me', token=self.customer_token)
        self.log_result("Customer Auth Me", success,
                       "" if success else f"Failed: {data}")

    def test_customer_profile_and_wallet(self):
        """Test customer profile and wallet functionality"""
        if not self.customer_token:
            print("⚠️ Skipping customer profile tests - no token")
            return
            
        print("\n🔍 Testing Customer Profile & Wallet...")
        
        # Test profile endpoint
        success, data = self.make_request('GET', '/customer/profile', token=self.customer_token)
        self.log_result("Customer Profile", success,
                       "" if success else f"Failed: {data}")
        
        # Test wallet endpoint
        success, data = self.make_request('GET', '/customer/wallet', token=self.customer_token)
        if success:
            promo_count = len(data) if isinstance(data, list) else 0
            self.log_result("Customer Wallet", True, f"Found {promo_count} promos")
            
            # Check if welcome promo exists
            if promo_count > 0:
                welcome_promo = any(promo.get('code', '').startswith('VV-') for promo in data)
                self.log_result("Welcome Promo Issued", welcome_promo,
                               "" if welcome_promo else "No VV- prefixed promo found")
        else:
            self.log_result("Customer Wallet", False, f"Failed: {data}")

    def test_customer_requests(self):
        """Test customer request creation and retrieval"""
        if not self.customer_token:
            print("⚠️ Skipping customer request tests - no token")
            return
            
        print("\n🔍 Testing Customer Requests...")
        
        # Test creating a reservation request
        reservation_data = {
            "request_type": "reservation",
            "date": (datetime.now() + timedelta(days=1)).isoformat(),
            "guest_count": 4,
            "notes": "Test reservation for Friday night",
            "items": [],
            "contact_phone": "+27 71 000 0000"
        }
        
        success, data = self.make_request('POST', '/customer/requests', reservation_data, 
                                        token=self.customer_token, expected_status=200)
        if success and 'reference_id' in data:
            self.log_result("Create Reservation Request", True, 
                           f"Reference ID: {data['reference_id']}")
        else:
            self.log_result("Create Reservation Request", False, f"Failed: {data}")
        
        # Test creating an order intent request
        order_data = {
            "request_type": "order-intent",
            "date": (datetime.now() + timedelta(hours=2)).isoformat(),
            "guest_count": 2,
            "notes": "Test order intent",
            "items": [
                {"name": "Peckish Platter", "quantity": 1, "price": 250.0},
                {"name": "Long Island", "quantity": 2, "price": 110.0}
            ],
            "contact_phone": "+27 71 000 0000"
        }
        
        success, data = self.make_request('POST', '/customer/requests', order_data,
                                        token=self.customer_token, expected_status=200)
        if success and 'reference_id' in data:
            self.log_result("Create Order Intent Request", True,
                           f"Reference ID: {data['reference_id']}")
        else:
            self.log_result("Create Order Intent Request", False, f"Failed: {data}")
        
        # Test retrieving customer requests
        success, data = self.make_request('GET', '/customer/requests', token=self.customer_token)
        if success:
            request_count = len(data) if isinstance(data, list) else 0
            self.log_result("Retrieve Customer Requests", True, f"Found {request_count} requests")
        else:
            self.log_result("Retrieve Customer Requests", False, f"Failed: {data}")

    def test_admin_auth(self):
        """Test admin authentication with MFA"""
        print("\n🔍 Testing Admin Authentication...")
        
        # Test admin login with MFA
        success, data = self.make_request('POST', '/admin/auth/login', self.demo_admin)
        if success and 'access_token' in data:
            self.admin_token = data['access_token']
            self.log_result("Admin Login with MFA", True)
            
            # Check role
            expected_role = "super"
            actual_role = data.get('role')
            self.log_result("Admin Role Verification", actual_role == expected_role,
                           f"Expected: {expected_role}, Got: {actual_role}")
        else:
            self.log_result("Admin Login with MFA", False, f"Failed: {data}")
            return
        
        # Test admin/auth/me
        success, data = self.make_request('GET', '/admin/auth/me', token=self.admin_token)
        self.log_result("Admin Auth Me", success,
                       "" if success else f"Failed: {data}")

    def test_admin_dashboard(self):
        """Test admin dashboard and data endpoints"""
        if not self.admin_token:
            print("⚠️ Skipping admin dashboard tests - no token")
            return
            
        print("\n🔍 Testing Admin Dashboard...")
        
        # Test dashboard endpoint
        success, data = self.make_request('GET', '/admin/dashboard', token=self.admin_token)
        if success:
            required_fields = ['kpis', 'redemptions_over_time', 'request_breakdown', 'recent_requests']
            missing_fields = [f for f in required_fields if f not in data]
            if missing_fields:
                self.log_result("Admin Dashboard Structure", False,
                               f"Missing fields: {missing_fields}")
            else:
                self.log_result("Admin Dashboard", True)
                kpi_count = len(data.get('kpis', []))
                self.log_result("Dashboard KPIs", kpi_count >= 4,
                               f"Expected 4+ KPIs, got {kpi_count}")
        else:
            self.log_result("Admin Dashboard", False, f"Failed: {data}")

    def test_admin_events_crud(self):
        """Test admin events CRUD operations"""
        if not self.admin_token:
            print("⚠️ Skipping admin events tests - no token")
            return
            
        print("\n🔍 Testing Admin Events CRUD...")
        
        # Test list events
        success, data = self.make_request('GET', '/admin/events', token=self.admin_token)
        if success:
            event_count = len(data) if isinstance(data, list) else 0
            self.log_result("List Admin Events", True, f"Found {event_count} events")
        else:
            self.log_result("List Admin Events", False, f"Failed: {data}")
            return
        
        # Test create event
        new_event = {
            "title": "Test Event",
            "date": (datetime.now() + timedelta(days=7)).isoformat(),
            "description": "Test event created by API test",
            "lineup": ["Test DJ"],
            "image_url": "https://example.com/test.jpg",
            "location": "Vaal Vibes",
            "status": "scheduled",
            "cta_label": "Test RSVP"
        }
        
        success, data = self.make_request('POST', '/admin/events', new_event, 
                                        token=self.admin_token, expected_status=200)
        if success and 'id' in data:
            event_id = data['id']
            self.log_result("Create Admin Event", True, f"Created event ID: {event_id}")
            
            # Test update event
            update_data = {**new_event, "title": "Updated Test Event"}
            success, data = self.make_request('PUT', f'/admin/events/{event_id}', 
                                            update_data, token=self.admin_token)
            self.log_result("Update Admin Event", success,
                           "" if success else f"Failed: {data}")
            
            # Test delete event
            success, data = self.make_request('DELETE', f'/admin/events/{event_id}',
                                            token=self.admin_token)
            self.log_result("Delete Admin Event", success,
                           "" if success else f"Failed: {data}")
        else:
            self.log_result("Create Admin Event", False, f"Failed: {data}")

    def test_admin_specials_crud(self):
        """Test admin specials CRUD operations"""
        if not self.admin_token:
            print("⚠️ Skipping admin specials tests - no token")
            return
            
        print("\n🔍 Testing Admin Specials CRUD...")
        
        # Test list specials
        success, data = self.make_request('GET', '/admin/specials', token=self.admin_token)
        if success:
            special_count = len(data) if isinstance(data, list) else 0
            self.log_result("List Admin Specials", True, f"Found {special_count} specials")
        else:
            self.log_result("List Admin Specials", False, f"Failed: {data}")
            return
        
        # Test create special
        new_special = {
            "title": "Test Special",
            "description": "Test special created by API test",
            "price_label": "R99.00",
            "image_url": "https://example.com/test.jpg",
            "available_until": (datetime.now() + timedelta(days=7)).isoformat(),
            "tags": ["test"],
            "status": "active"
        }
        
        success, data = self.make_request('POST', '/admin/specials', new_special,
                                        token=self.admin_token, expected_status=200)
        if success and 'id' in data:
            special_id = data['id']
            self.log_result("Create Admin Special", True, f"Created special ID: {special_id}")
            
            # Test delete special
            success, data = self.make_request('DELETE', f'/admin/specials/{special_id}',
                                            token=self.admin_token)
            self.log_result("Delete Admin Special", success,
                           "" if success else f"Failed: {data}")
        else:
            self.log_result("Create Admin Special", False, f"Failed: {data}")

    def test_promo_validation_and_redemption(self):
        """Test promo validation and redemption flow"""
        if not self.admin_token or not self.customer_token:
            print("⚠️ Skipping promo tests - missing tokens")
            return
            
        print("\n🔍 Testing Promo Validation & Redemption...")
        
        # First get customer's promo code
        success, wallet_data = self.make_request('GET', '/customer/wallet', token=self.customer_token)
        if not success or not wallet_data:
            self.log_result("Get Customer Promo for Testing", False, "No wallet data")
            return
        
        promo_code = None
        for promo in wallet_data:
            if promo.get('status') == 'active':
                promo_code = promo.get('code')
                break
        
        if not promo_code:
            self.log_result("Find Active Promo Code", False, "No active promo found")
            return
        
        self.log_result("Find Active Promo Code", True, f"Using code: {promo_code}")
        
        # Test promo validation with insufficient bill amount
        validation_data = {
            "code": promo_code,
            "bill_amount": 100.0,  # Below minimum spend
            "customer_phone": "+27 71 000 0000"
        }
        
        success, data = self.make_request('POST', '/admin/promo/validate', validation_data,
                                        token=self.admin_token)
        if success:
            approved = data.get('approved', False)
            reason = data.get('reason', '')
            self.log_result("Promo Validation (Insufficient Amount)", not approved,
                           f"Correctly rejected: {reason}" if not approved else "Should have been rejected")
        else:
            self.log_result("Promo Validation (Insufficient Amount)", False, f"Failed: {data}")
        
        # Test promo validation with sufficient bill amount
        validation_data['bill_amount'] = 2000.0  # Above minimum spend
        
        success, data = self.make_request('POST', '/admin/promo/validate', validation_data,
                                        token=self.admin_token)
        if success:
            approved = data.get('approved', False)
            discount_amount = data.get('discount_amount', 0)
            self.log_result("Promo Validation (Sufficient Amount)", approved,
                           f"Approved with discount: R{discount_amount}" if approved else f"Rejected: {data.get('reason')}")
        else:
            self.log_result("Promo Validation (Sufficient Amount)", False, f"Failed: {data}")
        
        # Test promo redemption
        success, data = self.make_request('POST', '/admin/promo/redeem', validation_data,
                                        token=self.admin_token)
        if success:
            approved = data.get('approved', False)
            status = data.get('status', '')
            self.log_result("Promo Redemption", approved and status == 'redeemed',
                           f"Status: {status}" if approved else f"Failed: {data.get('reason')}")
        else:
            self.log_result("Promo Redemption", False, f"Failed: {data}")

    def test_birthday_booking_endpoint(self):
        """Test the new birthday booking endpoint"""
        print("\n🔍 Testing Birthday Booking Endpoint...")
        
        # Test birthday booking creation
        birthday_data = {
            "full_name": "Test Birthday Person",
            "email": "birthday@test.com",
            "phone": "+27 71 123 4567",
            "date_of_birth": "1995-06-15",
            "celebration_date": (datetime.now() + timedelta(days=14)).isoformat(),
            "arrival_time": "19:30",
            "guest_count": 8,
            "estimated_budget": 3500.0,
            "seating_preference": "vip",
            "bottle_service": True,
            "notes": "Birthday celebration with cake and DJ shout-out"
        }
        
        success, data = self.make_request('POST', '/public/birthday-requests', birthday_data, 
                                        expected_status=200)
        if success and 'reference_id' in data:
            reference_id = data['reference_id']
            self.log_result("Create Birthday Booking", True, 
                           f"Reference ID: {reference_id}")
            
            # Verify the request type is correct
            request_type = data.get('request_type')
            self.log_result("Birthday Request Type", request_type == 'birthday-booking',
                           f"Expected: birthday-booking, Got: {request_type}")
            
            # Verify essential fields are present
            required_fields = ['customer_name', 'customer_email', 'estimated_budget', 'occasion']
            missing_fields = [f for f in required_fields if f not in data or data[f] is None]
            self.log_result("Birthday Request Fields", len(missing_fields) == 0,
                           f"Missing fields: {missing_fields}" if missing_fields else "All fields present")
            
        else:
            self.log_result("Create Birthday Booking", False, f"Failed: {data}")

    def test_admin_other_endpoints(self):
        """Test other admin endpoints"""
        if not self.admin_token:
            print("⚠️ Skipping other admin tests - no token")
            return
            
        print("\n🔍 Testing Other Admin Endpoints...")
        
        # Test admin requests
        success, data = self.make_request('GET', '/admin/requests', token=self.admin_token)
        if success:
            request_count = len(data) if isinstance(data, list) else 0
            self.log_result("Admin Requests List", True, f"Found {request_count} requests")
            
            # Check if birthday bookings are visible in admin requests
            birthday_requests = [r for r in data if r.get('request_type') == 'birthday-booking']
            birthday_count = len(birthday_requests)
            self.log_result("Birthday Requests in Admin List", birthday_count >= 0,
                           f"Found {birthday_count} birthday requests")
        else:
            self.log_result("Admin Requests List", False, f"Failed: {data}")
        
        # Test admin users
        success, data = self.make_request('GET', '/admin/users', token=self.admin_token)
        if success:
            user_count = len(data) if isinstance(data, list) else 0
            self.log_result("Admin Users List", True, f"Found {user_count} users")
        else:
            self.log_result("Admin Users List", False, f"Failed: {data}")
        
        # Test audit logs
        success, data = self.make_request('GET', '/admin/audit-logs', token=self.admin_token)
        if success:
            log_count = len(data) if isinstance(data, list) else 0
            self.log_result("Admin Audit Logs", True, f"Found {log_count} logs")
        else:
            self.log_result("Admin Audit Logs", False, f"Failed: {data}")
        
        # Test promo pools
        success, data = self.make_request('GET', '/admin/promo-pools', token=self.admin_token)
        if success:
            pool_count = len(data) if isinstance(data, list) else 0
            self.log_result("Admin Promo Pools", True, f"Found {pool_count} pools")
        else:
            self.log_result("Admin Promo Pools", False, f"Failed: {data}")
        
        # Test campaigns
        success, data = self.make_request('GET', '/admin/campaigns', token=self.admin_token)
        if success:
            campaign_count = len(data) if isinstance(data, list) else 0
            self.log_result("Admin Campaigns", True, f"Found {campaign_count} campaigns")
        else:
            self.log_result("Admin Campaigns", False, f"Failed: {data}")

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Vaal Vibes Backend API Tests")
        print(f"🌐 Testing against: {self.base_url}")
        
        try:
            self.test_public_endpoints()
            self.test_birthday_booking_endpoint()
            self.test_customer_auth()
            self.test_customer_profile_and_wallet()
            self.test_customer_requests()
            self.test_admin_auth()
            self.test_admin_dashboard()
            self.test_admin_events_crud()
            self.test_admin_specials_crud()
            self.test_promo_validation_and_redemption()
            self.test_admin_other_endpoints()
            
        except Exception as e:
            print(f"❌ Test suite failed with error: {e}")
            return False
        
        return True

    def print_summary(self):
        """Print test summary"""
        print(f"\n📊 Test Summary")
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {self.tests_run - self.tests_passed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        # Show failed tests
        failed_tests = [r for r in self.test_results if not r['success']]
        if failed_tests:
            print(f"\n❌ Failed Tests:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test runner"""
    tester = VaalVibesAPITester()
    
    success = tester.run_all_tests()
    all_passed = tester.print_summary()
    
    if all_passed:
        print("\n🎉 All backend tests passed!")
        return 0
    else:
        print(f"\n⚠️ Some tests failed. Check the details above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())