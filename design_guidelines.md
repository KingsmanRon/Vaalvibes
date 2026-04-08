{
  "brand": {
    "name": "Vaal Vibes",
    "attributes": [
      "nightlife",
      "premium",
      "energetic",
      "high-contrast",
      "mobile-first",
      "confident",
      "minimal-but-luxe"
    ],
    "non_negotiables": [
      "Match uploaded Vaal Vibes black/white/gold identity exactly.",
      "Palette must use: matte black #111111, surface #1a1a1a, accent gold #F5C518, white text, muted #B5B5B5.",
      "No online payments/POS in MVP. All flows are request/reservation/order-intent only.",
      "Avoid gradients except subtle decorative section backgrounds (<=20% viewport).",
      "All interactive + key informational elements MUST include data-testid (kebab-case).",
      "Project uses .js (not .tsx)."
    ]
  },
  "design_personality": {
    "visual_metaphor": "Matte-black venue walls + brushed-gold foil stamp + crisp white type. Think: VIP wristband + menu board + bouncer clipboard.",
    "layout_principles": [
      "Mobile-first, thumb-friendly bottom navigation for customer PWA.",
      "Admin uses left rail on desktop, collapses to sheet/drawer on mobile.",
      "Bento grids for highlights (specials/events/promos) with strong hierarchy.",
      "Use generous spacing; avoid cramped lists—nightlife luxury needs breathing room.",
      "Use subtle grain/noise overlay to prevent flat black surfaces."
    ]
  },
  "inspiration_refs": {
    "search_targets": [
      "Dribbble: black gold UI, PWA, event management dashboard",
      "Behance: mobile dashboard UI, wallet screen, event dashboard",
      "Patterns: QR menu vertical sections, ticket-like promo cards, redemption scanner UI"
    ],
    "notes": [
      "Borrow: high-contrast black surfaces + gold accent lines + card-based content.",
      "Fuse: nightlife hero photography (dark) + Swiss-style typography grid + shadcn components."
    ]
  },
  "typography": {
    "font_pairing": {
      "display": {
        "name": "Bebas Neue",
        "usage": "Hero headings, section titles (sparingly), event poster-style moments",
        "fallback": "Impact, system-ui"
      },
      "body": {
        "name": "Space Grotesk",
        "usage": "UI labels, body copy, tables, admin",
        "fallback": "Inter, system-ui"
      }
    },
    "implementation": {
      "google_fonts": [
        "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600;700&display=swap"
      ],
      "tailwind_usage": {
        "display_class": "font-[\"Bebas_Neue\"] tracking-[0.04em]",
        "body_class": "font-[\"Space_Grotesk\"]"
      }
    },
    "type_scale": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl",
      "h2": "text-base md:text-lg",
      "body": "text-sm sm:text-base",
      "small": "text-xs sm:text-sm",
      "numbers_kpi": "text-2xl sm:text-3xl font-semibold tabular-nums"
    },
    "rules": [
      "Avoid long paragraphs in Bebas Neue; keep it punchy.",
      "Use Space Grotesk for readability on dark backgrounds.",
      "Use tabular-nums for wallet balances, KPIs, and promo codes."
    ]
  },
  "color_system": {
    "palette_hex": {
      "black_matte": "#111111",
      "surface": "#1A1A1A",
      "surface_2": "#202020",
      "gold": "#F5C518",
      "white": "#FFFFFF",
      "muted": "#B5B5B5",
      "border": "#2A2A2A",
      "success": "#2EE59D",
      "warning": "#F5C518",
      "danger": "#FF4D4D",
      "info": "#7DD3FC"
    },
    "semantic_tokens_hsl": {
      "note": "Set these in /frontend/src/index.css :root and .dark. Keep app in dark theme by default for brand; optionally allow light mode for admin tables but still brand-consistent.",
      "dark_theme": {
        "--background": "0 0% 7%",
        "--foreground": "0 0% 98%",
        "--card": "0 0% 10%",
        "--card-foreground": "0 0% 98%",
        "--popover": "0 0% 10%",
        "--popover-foreground": "0 0% 98%",
        "--primary": "46 92% 53%",
        "--primary-foreground": "0 0% 7%",
        "--secondary": "0 0% 13%",
        "--secondary-foreground": "0 0% 98%",
        "--muted": "0 0% 13%",
        "--muted-foreground": "0 0% 71%",
        "--accent": "46 92% 53%",
        "--accent-foreground": "0 0% 7%",
        "--destructive": "0 84% 60%",
        "--destructive-foreground": "0 0% 98%",
        "--border": "0 0% 16%",
        "--input": "0 0% 16%",
        "--ring": "46 92% 53%",
        "--radius": "0.75rem"
      }
    },
    "usage_rules": [
      "Gold is an accent, not a fill-everywhere color. Use it for CTAs, active states, key numbers, and separators.",
      "Default surfaces are matte black/surface; cards slightly lighter than background.",
      "Borders are subtle (#2A2A2A) to avoid harsh outlines.",
      "Never use purple in this app."
    ]
  },
  "gradients_and_texture": {
    "allowed_gradients": [
      {
        "name": "hero-sheen",
        "css": "radial-gradient(1200px circle at 20% 0%, rgba(245,197,24,0.14), transparent 55%), radial-gradient(900px circle at 80% 20%, rgba(255,255,255,0.06), transparent 60%)",
        "usage": "Hero background overlay only (decorative)."
      },
      {
        "name": "gold-glow-divider",
        "css": "linear-gradient(90deg, transparent, rgba(245,197,24,0.55), transparent)",
        "usage": "Section divider line (full width, 1px height)."
      }
    ],
    "noise_overlay": {
      "css_snippet": ".vv-noise::before{content:\"\";position:absolute;inset:0;background-image:url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22 opacity=%220.08%22/%3E%3C/svg%3E');mix-blend-mode:overlay;pointer-events:none;border-radius:inherit;}",
      "usage": "Apply to hero, large cards, and admin header panels. Keep opacity <= 0.10."
    }
  },
  "layout_and_grid": {
    "customer_pwa": {
      "max_width": "max-w-[560px] mx-auto (only for content columns; do NOT center-align text globally)",
      "page_padding": "px-4 sm:px-6",
      "sections": [
        "Hero (image + title + quick actions)",
        "Tonight's Specials (carousel)",
        "Upcoming Events (cards)",
        "Menu categories (tabs/accordion)",
        "Wallet teaser + CTA",
        "Reservation/Order Request CTA"
      ],
      "navigation": {
        "pattern": "Bottom nav (5 items) + optional top app bar",
        "items": ["Home", "Menu", "Events", "Wallet", "Profile"],
        "component": "/app/frontend/src/components/ui/navigation-menu.jsx (for desktop) + custom bottom bar using Button/Tooltip"
      }
    },
    "admin_dashboard": {
      "grid": "12-col on lg, 6-col on md, 1-col on mobile",
      "shell": "Left rail (Sheet on mobile) + top bar with search + user menu",
      "content_padding": "p-4 sm:p-6 lg:p-8",
      "kpi_row": "grid grid-cols-2 lg:grid-cols-4 gap-3",
      "tables": "Use ScrollArea for horizontal overflow on mobile"
    }
  },
  "components": {
    "component_path": {
      "buttons": "/app/frontend/src/components/ui/button.jsx",
      "inputs": "/app/frontend/src/components/ui/input.jsx",
      "textarea": "/app/frontend/src/components/ui/textarea.jsx",
      "select": "/app/frontend/src/components/ui/select.jsx",
      "tabs": "/app/frontend/src/components/ui/tabs.jsx",
      "accordion": "/app/frontend/src/components/ui/accordion.jsx",
      "card": "/app/frontend/src/components/ui/card.jsx",
      "badge": "/app/frontend/src/components/ui/badge.jsx",
      "dialog": "/app/frontend/src/components/ui/dialog.jsx",
      "drawer": "/app/frontend/src/components/ui/drawer.jsx",
      "sheet": "/app/frontend/src/components/ui/sheet.jsx",
      "dropdown": "/app/frontend/src/components/ui/dropdown-menu.jsx",
      "table": "/app/frontend/src/components/ui/table.jsx",
      "pagination": "/app/frontend/src/components/ui/pagination.jsx",
      "calendar": "/app/frontend/src/components/ui/calendar.jsx",
      "toast": "/app/frontend/src/components/ui/sonner.jsx",
      "skeleton": "/app/frontend/src/components/ui/skeleton.jsx",
      "separator": "/app/frontend/src/components/ui/separator.jsx",
      "scroll_area": "/app/frontend/src/components/ui/scroll-area.jsx",
      "avatar": "/app/frontend/src/components/ui/avatar.jsx",
      "tooltip": "/app/frontend/src/components/ui/tooltip.jsx",
      "progress": "/app/frontend/src/components/ui/progress.jsx"
    },
    "button_system": {
      "shape": "Luxury / Elegant: rounded-lg (10–12px), tall-ish",
      "sizes": {
        "sm": "h-9 px-3 text-sm",
        "md": "h-11 px-4 text-sm",
        "lg": "h-12 px-5 text-base"
      },
      "variants": {
        "primary": "bg-[#F5C518] text-[#111111] hover:bg-[#ffd24a] focus-visible:ring-[#F5C518]",
        "secondary": "bg-[#1A1A1A] text-white border border-[#2A2A2A] hover:border-[#F5C518]/60",
        "ghost": "bg-transparent text-white hover:bg-white/5",
        "danger": "bg-[#FF4D4D] text-[#111111] hover:bg-[#ff6b6b]"
      },
      "micro_interaction": "On hover: translate-y-[-1px] + shadow; on press: scale-[0.98]. Use transition-colors + transition-shadow (no transition-all)."
    },
    "cards": {
      "base": "bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl",
      "hover": "hover:border-[#F5C518]/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.45)]",
      "special_card": "Add a 1px gold top rule: before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-[rgba(245,197,24,0.65)]"
    },
    "badges": {
      "event": "bg-[#F5C518]/15 text-[#F5C518] border border-[#F5C518]/25",
      "status_success": "bg-[#2EE59D]/15 text-[#2EE59D] border border-[#2EE59D]/25",
      "status_pending": "bg-white/10 text-white border border-white/15"
    },
    "forms": {
      "pattern": "Use shadcn Form + Label + Input + Select + Textarea. Group fields into Cards with clear section titles.",
      "focus": "Inputs: bg-[#111111] border-[#2A2A2A] focus-visible:ring-[#F5C518]",
      "validation": "Inline error text in muted red; also toast via sonner."
    },
    "tables_admin": {
      "pattern": "Table + sticky header + row hover",
      "row_hover": "hover:bg-white/5",
      "empty_state": "Card with icon + CTA button"
    }
  },
  "page_blueprints": {
    "customer": {
      "landing_home": {
        "hero": [
          "Full-bleed hero image with dark overlay + subtle hero-sheen gradient.",
          "Title (Bebas Neue), subtitle (Space Grotesk), quick CTAs: View Menu, Reserve, Events.",
          "Add a thin gold divider under hero content."
        ],
        "sections": [
          "Tonight's Specials (Carousel)",
          "Upcoming Events (Card list)",
          "Promo Wallet teaser (Card)",
          "Location/Hours (Accordion)"
        ]
      },
      "menu": {
        "layout": [
          "Tabs for categories (Food, Cocktails, Beer, Spirits, Non-alcoholic).",
          "Each category uses Accordion for subcategories.",
          "Menu item row: name + description + price; optional badge (New/Hot)."
        ],
        "interaction": [
          "Sticky category tabs on scroll.",
          "Add-to-request: Button opens Drawer to build an order request (no payment)."
        ]
      },
      "events": {
        "layout": [
          "Filter chips (Tabs or ToggleGroup): This Week, This Month, All.",
          "Event cards with date badge, title, lineup, CTA: Request Booking / RSVP intent."
        ],
        "calendar": "Use shadcn Calendar for date picking in RSVP/reservation flow."
      },
      "specials": {
        "layout": [
          "Bento grid of specials with strong imagery.",
          "Each special opens Dialog with details + request button."
        ]
      },
      "wallet": {
        "layout": [
          "Balance + available promos at top (tabular-nums).",
          "Promo cards: code, terms, expiry, CTA: Show to staff.",
          "Optional QR display area (MOCKED until backend supports)."
        ],
        "redeem": "Customer side is view-only; redemption happens in admin redeem screen."
      },
      "reservation_order_request": {
        "layout": [
          "Multi-step form in Card: Details -> Date/Time -> Notes -> Confirm.",
          "Use Progress component for step indicator.",
          "Confirmation screen shows 'Request sent' + reference ID."
        ]
      },
      "profile_preferences": {
        "layout": [
          "Avatar + name + contact.",
          "Preferences: dietary, seating, music vibe (Checkbox/RadioGroup).",
          "Security: change password, logout."
        ]
      }
    },
    "admin": {
      "login": {
        "layout": [
          "Centered card on dark background but keep text left-aligned.",
          "Gold accent line + venue mark.",
          "Use Input + Button; include 'Forgot password' (MOCKED if not implemented)."
        ]
      },
      "dashboard_overview": {
        "kpis": [
          "Requests today",
          "Upcoming events",
          "Active campaigns",
          "Promos redeemed"
        ],
        "charts": [
          "Use Recharts for redemptions over time + campaign performance."
        ],
        "recent_activity": "Audit log preview table with filters"
      },
      "events_crud": {
        "layout": [
          "Table with search + filters + Create Event button.",
          "Create/Edit in Sheet (desktop) or Drawer (mobile).",
          "Date selection via Calendar."
        ]
      },
      "specials_crud": {
        "layout": [
          "Card grid preview + table view toggle (Tabs).",
          "Image upload placeholder (MOCKED if storage not ready)."
        ]
      },
      "campaigns": {
        "layout": [
          "Campaign list table.",
          "Composer: form with audience, schedule, promo pool, message.",
          "Preview panel styled like customer promo card."
        ]
      },
      "promo_pools": {
        "layout": [
          "Pools list with counts.",
          "Pool editor: generate/import codes (MOCKED if generation not implemented), set expiry, rules."
        ]
      },
      "promo_validate_redeem": {
        "layout": [
          "Big input for promo code + optional customer phone.",
          "Validate result card: status badge + details.",
          "Redeem button requires confirmation AlertDialog."
        ],
        "interaction": [
          "Success triggers sonner toast + confetti-free subtle glow pulse on card border (gold)."
        ]
      },
      "users": {
        "layout": [
          "Table with role badges.",
          "User detail in Sheet with audit trail snippet."
        ]
      },
      "audit_logs": {
        "layout": [
          "Table with date range filter (Calendar in Popover).",
          "Row expands (Collapsible) to show JSON payload."
        ]
      }
    }
  },
  "motion_and_microinteractions": {
    "library": {
      "recommended": "framer-motion",
      "install": "npm i framer-motion",
      "usage": [
        "Page transitions: fade + slight y (8px) on enter.",
        "Card hover: shadow + border tint.",
        "Bottom nav active indicator: sliding gold pill."
      ]
    },
    "principles": [
      "Fast and tight: 160–220ms for hover, 240–320ms for page transitions.",
      "Use ease-out for entrances, ease-in for exits.",
      "Respect prefers-reduced-motion: disable parallax and large transitions."
    ],
    "no_go": [
      "No bouncing cartoon motion.",
      "No full-screen gradient animations.",
      "No transition: all."
    ]
  },
  "data_viz_admin": {
    "library": {
      "recommended": "recharts",
      "install": "npm i recharts",
      "styling": [
        "Lines/bars in gold (#F5C518) with muted gridlines (#2A2A2A).",
        "Tooltip uses Card styling (surface + border)."
      ]
    },
    "empty_states": [
      "Use Skeleton for loading.",
      "Use Card with concise copy + CTA for empty lists (e.g., 'Create your first event')."
    ]
  },
  "icons": {
    "library": "lucide-react",
    "rules": [
      "No emoji icons.",
      "Use consistent stroke width (1.75–2).",
      "Gold icons only for active/primary; otherwise muted white/gray."
    ]
  },
  "pwa_shell": {
    "offline": [
      "Offline-friendly shell: show cached navigation + last known menu/events.",
      "Use a dedicated offline banner (Alert component) when network is down."
    ],
    "install_prompt": [
      "Use a bottom Sheet prompt after 2nd visit.",
      "CTA button: 'Install Vaal Vibes' (primary)."
    ]
  },
  "accessibility": {
    "contrast": [
      "White on #111111 passes; ensure muted text (#B5B5B5) is not used for critical info.",
      "Gold text on black is OK for headings/accents; avoid gold for long paragraphs."
    ],
    "focus": [
      "Always visible focus ring: ring-2 ring-[#F5C518] ring-offset-2 ring-offset-[#111111]."
    ],
    "touch_targets": [
      "Minimum 44px height for primary actions.",
      "Bottom nav items: min-h-12."
    ],
    "reduced_motion": [
      "Disable parallax and large entrance animations when prefers-reduced-motion is enabled."
    ]
  },
  "testing_attributes": {
    "convention": "kebab-case describing role",
    "examples": [
      "data-testid=\"customer-login-submit-button\"",
      "data-testid=\"menu-category-tabs\"",
      "data-testid=\"event-card\"",
      "data-testid=\"admin-dashboard-kpi-requests-today\"",
      "data-testid=\"promo-redeem-confirm-button\"",
      "data-testid=\"audit-log-table\""
    ]
  },
  "image_urls": {
    "hero_background": [
      {
        "url": "https://images.unsplash.com/photo-1618176581124-72177645bd15?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MTJ8MHwxfHNlYXJjaHwxfHxkaiUyMG5pZ2h0Y2x1YiUyMGNyb3dkJTIwbGlnaHRzJTIwZGFya3xlbnwwfHx8YmxhY2t8MTc3NTY4ODE4M3ww&ixlib=rb-4.1.0&q=85",
        "description": "Nightclub crowd + lights; use with dark overlay for landing hero"
      }
    ],
    "menu_section": [
      {
        "url": "https://images.unsplash.com/photo-1583873583541-dcbf3120ff05?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxjb2NrdGFpbCUyMGJhciUyMGRyaW5rJTIwY2xvc2V1cCUyMGRhcmslMjBiYWNrZ3JvdW5kfGVufDB8fHxibGFja3wxNzc1Njg4MTgwfDA&ixlib=rb-4.1.0&q=85",
        "description": "Cocktail/drinks close-up for menu header or specials cards"
      }
    ],
    "venue_texture": [
      {
        "url": "https://images.unsplash.com/photo-1552850628-8d5016e73245?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwbmlnaHRsaWZlJTIwYmFyJTIwaW50ZXJpb3IlMjBibGFjayUyMGdvbGR8ZW58MHx8fGJsYWNrfDE3NzU2ODgxNzh8MA&ixlib=rb-4.1.0&q=85",
        "description": "Abstract gold/metal detail; use as subtle background in admin header panels"
      }
    ]
  },
  "instructions_to_main_agent": [
    "Update /frontend/src/index.css tokens to match Vaal Vibes palette (dark-first).",
    "Remove default CRA centered header styles from App.css; do not center app container globally.",
    "Implement customer bottom navigation + admin left-rail shell using shadcn Sheet/Drawer.",
    "Use shadcn Calendar for any date picking (reservations, events, audit filters).",
    "Use sonner for toasts; ensure all buttons/inputs/tables have data-testid.",
    "No online payment UI; label CTAs as 'Request order' / 'Send request' / 'Reserve' and show 'Pay at venue' copy.",
    "Keep gradients minimal and decorative only; rely on matte surfaces + gold accents + noise overlay for richness.",
    "If any feature is not implemented (QR promo, image upload, code generation), label it clearly as MOCKED in UI copy/tooltips."
  ]
}

<General UI UX Design Guidelines>  
    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms
    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text
   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json

 **GRADIENT RESTRICTION RULE**
NEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc
NEVER use dark gradients for logo, testimonial, footer etc
NEVER let gradients cover more than 20% of the viewport.
NEVER apply gradients to text-heavy content or reading areas.
NEVER use gradients on small UI elements (<100px width).
NEVER stack multiple gradient layers in the same viewport.

**ENFORCEMENT RULE:**
    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors

**How and where to use:**
   • Section backgrounds (not content backgrounds)
   • Hero section header content. Eg: dark to light to dark color
   • Decorative overlays and accent elements only
   • Hero section with 2-3 mild color
   • Gradients creation can be done for any angle say horizontal, vertical or diagonal

- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**

</Font Guidelines>

- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. 
   
- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.

- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.
   
- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly
    Eg: - if it implies playful/energetic, choose a colorful scheme
           - if it implies monochrome/minimal, choose a black–white/neutral scheme

**Component Reuse:**
	- Prioritize using pre-existing components from src/components/ui when applicable
	- Create new components that match the style and conventions of existing components when needed
	- Examine existing components to understand the project's component patterns before creating new ones

**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component

**Best Practices:**
	- Use Shadcn/UI as the primary component library for consistency and accessibility
	- Import path: ./components/[component-name]

**Export Conventions:**
	- Components MUST use named exports (export const ComponentName = ...)
	- Pages MUST use default exports (export default function PageName() {...})

**Toasts:**
  - Use `sonner` for toasts"
  - Sonner component are located in `/app/src/components/ui/sonner.tsx`

Use 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.
</General UI UX Design Guidelines>
