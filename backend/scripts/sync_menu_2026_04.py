"""
One-time migration: sync the live menu to the April 2026 price list.

Why this exists:
    The seed_database() function in server.py only inserts default menu data
    when the collection is empty. Production already has the old menu, so
    redeploying server.py with new defaults will NOT update the live prices.

    This script wipes and re-inserts the menu_categories collection so the
    production DB matches the canonical structure in server.py.

How to run:
    From a Railway shell (or anywhere with MONGO_URL + DB_NAME set):

        cd backend
        python scripts/sync_menu_2026_04.py

    The script reads the same .env as the backend.

What it does:
    1. Connects using MONGO_URL + DB_NAME from the environment.
    2. Prints the current item count so you can sanity-check before changes.
    3. Asks for confirmation (type "yes" to proceed).
    4. Drops db.menu_categories and re-inserts the new structure.
    5. Prints the new item count.

Idempotent: yes — running it twice produces the same result.
Destructive: yes — any custom menu items added via /admin/menu will be lost.
             If you've made manual edits, prefer using the admin UI instead.
"""

from __future__ import annotations

import asyncio
import os
import sys
import uuid
from pathlib import Path

# Make `import server` work when running from backend/scripts/
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / ".env")


def menu_item(
    name: str,
    description: str,
    price: float,
    price_label: str,
    category: str,
    subcategory: str = "",
    featured: bool = False,
    tags: list[str] | None = None,
) -> dict:
    return {
        "id": str(uuid.uuid4()),
        "name": name,
        "description": description,
        "price": price,
        "price_label": price_label,
        "category": category,
        "subcategory": subcategory,
        "featured": featured,
        "tags": tags or [],
        "image_url": None,
    }


def menu_category(name: str, slug: str, description: str, items: list[dict]) -> dict:
    return {
        "id": str(uuid.uuid4()),
        "name": name,
        "slug": slug,
        "description": description,
        "items": items,
    }


# Canonical menu — keep in sync with server.py seed_database().
def build_menu() -> list[dict]:
    return [
        menu_category(
            "Food",
            "food",
            "Braai platters, plates, and sides.",
            [
                menu_item("Peckish", "Serves 2-4. 200g Chuck, 200g Wors, 200g Chicken Wings and 200g Liver. Served with pap, chakalaka and salsa.", 250, "R250.00", "Food", "Platters", featured=True, tags=["share", "popular"]),
                menu_item("Hungry", "Serves 2-4. 200g Chuck, 300g Wors, 400g Chicken Wings, 300g Liver and 200g Ribs. Served with pap, chakalaka and salsa.", 400, "R400.00", "Food", "Platters", featured=True, tags=["house-special"]),
                menu_item("Die Man", "Serves 4-6. 400g Chuck, 300g Wors, 500g Chicken Wings and 500g Liver. Served with pap, chakalaka and salsa.", 450, "R450.00", "Food", "Platters", tags=["platter"]),
                menu_item("Die Groot Man", "Serves 6-8. 500g Chuck, 500g Wors, 500g Chicken Wings, 500g Ribs and 500g Liver. Served with pap, chakalaka and salsa.", 700, "R700.00", "Food", "Platters", tags=["group"]),
                menu_item("Chuck Plate", "200g Chuck with pap, chakalaka and salsa.", 90, "R90.00", "Food", "Plates"),
                menu_item("Liver Plate", "200g Liver with pap, chakalaka and salsa.", 60, "R60.00", "Food", "Plates"),
                menu_item("Chicken Wings Plate", "3 chicken wings with pap, chakalaka and salsa.", 70, "R70.00", "Food", "Plates"),
                menu_item("Wors Plate", "300g Wors with pap, chakalaka and salsa.", 80, "R80.00", "Food", "Plates"),
                menu_item("Pap", "Side portion.", 15, "R15.00", "Food", "Extras"),
                menu_item("Chakalaka", "Side portion.", 15, "R15.00", "Food", "Extras"),
                menu_item("Salsa", "Side portion.", 15, "R15.00", "Food", "Extras"),
            ],
        ),
        menu_category(
            "Cocktails",
            "cocktails",
            "Signature cocktails and premium mixers.",
            [
                menu_item("Long Island", "Classic long island blend.", 110, "R110.00", "Cocktails", "Classics", featured=True),
                menu_item("Margarita", "Fresh lime and tequila.", 90, "R90.00", "Cocktails", "Classics"),
                menu_item("Mai Tai", "Dark rum and citrus.", 90, "R90.00", "Cocktails", "Classics"),
                menu_item("Strawberry Daiquiri", "Frozen strawberry daiquiri.", 80, "R80.00", "Cocktails", "Frozen"),
                menu_item("Mojito", "Mint, lime, and rum.", 70, "R70.00", "Cocktails", "Classics"),
                menu_item("Polloma", "Tequila and grapefruit fizz.", 70, "R70.00", "Cocktails", "Classics"),
                menu_item("Sunset Orange G&T", "Bright citrus gin and tonic.", 50, "R50.00", "Cocktails", "G&T"),
                menu_item("Pink Berry G&T", "Berry-forward gin and tonic.", 50, "R50.00", "Cocktails", "G&T"),
            ],
        ),
        menu_category(
            "Vodka",
            "vodka",
            "Vodka bottle service.",
            [
                menu_item("Belvedere", "Bottle.", 1000, "R1000", "Vodka", "Bottle", tags=["premium"]),
                menu_item("Smirnoff 1818", "Bottle.", 350, "R350", "Vodka", "Bottle"),
                menu_item("Absolut", "Bottle.", 650, "R650", "Vodka", "Bottle"),
            ],
        ),
        menu_category(
            "Gin",
            "gin",
            "Gin bottle service.",
            [
                menu_item("Tanqueray", "Bottle.", 650, "R650", "Gin", "Bottle"),
                menu_item("Tanqueray 10", "Bottle.", 1000, "R1000", "Gin", "Bottle", tags=["premium"]),
                menu_item("Gordons", "Bottle.", 350, "R350", "Gin", "Bottle"),
                menu_item("Hendricks", "Bottle. Shot R35.", 800, "R800", "Gin", "Bottle"),
                menu_item("Inverroche", "Bottle.", 800, "R800", "Gin", "Bottle"),
            ],
        ),
        menu_category(
            "Tequila",
            "tequila",
            "Tequila bottle service.",
            [
                menu_item("Jose Cuervo", "Bottle.", 650, "R650", "Tequila", "Bottle"),
                menu_item("Don Julio Blanco", "Bottle.", 1500, "R1500", "Tequila", "Bottle", tags=["premium"]),
                menu_item("Don Julio Reposado", "Bottle. Shot R70.", 2000, "R2000", "Tequila", "Bottle", tags=["premium"]),
                menu_item("Don Julio 1942", "Bottle. Ultra-premium.", 10000, "R10 000", "Tequila", "Bottle", featured=True, tags=["premium", "ultra"]),
            ],
        ),
        menu_category(
            "Whiskey",
            "whiskey",
            "Whiskey bottle service.",
            [
                menu_item("Glenfiddich 12", "Bottle. Shot R50.", 1600, "R1600", "Whiskey", "Bottle", tags=["premium"]),
                menu_item("Jameson Select", "Bottle.", 1000, "R1000", "Whiskey", "Bottle"),
                menu_item("Johnnie Walker Blue", "Bottle. Premium blend.", 6000, "R6000", "Whiskey", "Bottle", featured=True, tags=["premium"]),
            ],
        ),
        menu_category(
            "Cognac",
            "cognac",
            "Cognac bottle service.",
            [
                menu_item("Hennessy VS", "Bottle. Shot R40.", 1100, "R1100", "Cognac", "Hennessy", featured=True),
                menu_item("Hennessy VSOP", "Bottle.", 1800, "R1800", "Cognac", "Hennessy", tags=["premium"]),
                menu_item("Hennessy XO", "Bottle.", 6000, "R6000", "Cognac", "Hennessy", tags=["premium"]),
                menu_item("Martell VS", "Bottle. Shot R40.", 1100, "R1100", "Cognac", "Martell"),
                menu_item("Martell Blue Swift", "Bottle.", 1800, "R1800", "Cognac", "Martell", tags=["premium"]),
                menu_item("Courvoisier", "Bottle.", 1100, "R1100", "Cognac", "Courvoisier"),
                menu_item("Remy Martin VS", "Bottle. Shot R50.", 1300, "R1300", "Cognac", "Remy Martin"),
                menu_item("Remy Martin VSOP", "Bottle.", 2000, "R2000", "Cognac", "Remy Martin", tags=["premium"]),
                menu_item("Remy Martin 1738", "Bottle.", 3200, "R3200", "Cognac", "Remy Martin", tags=["premium"]),
                menu_item("Remy Martin XO", "Bottle.", 6500, "R6500", "Cognac", "Remy Martin", tags=["premium"]),
            ],
        ),
        menu_category(
            "Liquor",
            "liquor",
            "Herbal and specialty liquors.",
            [
                menu_item("Jagermeister", "Bottle. Shot R30.", 650, "R650", "Liquor", "Bottle"),
            ],
        ),
        menu_category(
            "Brandy",
            "brandy",
            "Brandy bottle service.",
            [
                menu_item("Richelieu", "Bottle. Shot R20.", 500, "R500", "Brandy", "Bottle"),
            ],
        ),
        menu_category(
            "Shots",
            "shots",
            "Shot specials.",
            [
                menu_item("Jager Bomb", "Comes in 2s.", 70, "R70", "Shots", "Specials", featured=True),
            ],
        ),
        menu_category(
            "Champagne",
            "champagne",
            "Champagne and prestige bottles.",
            [
                menu_item("Veuve Clicquot Yellow Label Brut", "Bottle.", 1500, "R1500", "Champagne", "Veuve Clicquot", featured=True),
                menu_item("Veuve Clicquot Rich", "Bottle.", 1800, "R1800", "Champagne", "Veuve Clicquot", tags=["premium"]),
                menu_item("Moet & Chandon Nectar Imperial", "Bottle.", 1800, "R1800", "Champagne", "Moet & Chandon", tags=["premium"]),
                menu_item("G.H. Mumm", "Bottle.", 1400, "R1400", "Champagne", "Mumm"),
                menu_item("Ace of Spades", "Bottle. Ultra-premium.", 8000, "R8000", "Champagne", "Armand de Brignac", featured=True, tags=["premium", "ultra"]),
            ],
        ),
        menu_category(
            "Beers",
            "beers",
            "Lagers and easy-pour bottles.",
            [
                menu_item("Corona", "Imported lager.", 35, "R35", "Beers", "Lager"),
                menu_item("Heineken", "Premium lager.", 30, "R30", "Beers", "Lager"),
                menu_item("Castle Light", "SA light lager.", 30, "R30", "Beers", "Lager"),
                menu_item("Carling Black Label", "SA classic lager.", 30, "R30", "Beers", "Lager"),
                menu_item("Heineken Silver", "Crisp light lager.", 20, "R20", "Beers", "Lager"),
                menu_item("Windhoek", "Smooth Namibian lager.", 35, "R35", "Beers", "Lager"),
            ],
        ),
        menu_category(
            "Ciders",
            "ciders",
            "Ciders and sparkling coolers.",
            [
                menu_item("Ice Tropez", "Sparkling cooler.", 100, "R100", "Ciders", "Cooler", featured=True),
                menu_item("Savannah", "Crisp apple cider.", 35, "R35", "Ciders", "Cider"),
                menu_item("Bernini Blush", "Light sparkling cider.", 30, "R30", "Ciders", "Cider"),
                menu_item("Other Ciders", "Hunters, Strongbow, etc.", 30, "R30", "Ciders", "Cider"),
            ],
        ),
        menu_category(
            "Wines",
            "wines",
            "Wines and rose.",
            [
                menu_item("Chateau", "House selection.", 35, "R35", "Wines", "Wine"),
                menu_item("Rupert & Rothschild", "Premium red.", 450, "R450", "Wines", "Wine", tags=["premium"]),
            ],
        ),
        menu_category(
            "Refreshers",
            "refreshers",
            "Soft drinks, waters, mixers, and energy drinks.",
            [
                menu_item("Sparkling Water 500ml", "Sparkling water.", 20, "R20.00", "Refreshers", "Water"),
                menu_item("Still Water 500ml", "Still water.", 20, "R20.00", "Refreshers", "Water"),
                menu_item("Coke 200ml", "Classic Coke.", 20, "R20.00", "Refreshers", "Soft Drinks"),
                menu_item("Sprite 300ml", "Lemon-lime soda.", 25, "R25.00", "Refreshers", "Soft Drinks"),
                menu_item("Appletiser 1.25L", "Sparkling apple juice.", 70, "R70.00", "Refreshers", "Soft Drinks"),
                menu_item("Redbull 250ml", "Energy drink.", 40, "R40.00", "Refreshers", "Energy"),
            ],
        ),
    ]


async def main() -> None:
    mongo_url = os.environ.get("MONGO_URL")
    db_name = os.environ.get("DB_NAME")
    if not mongo_url or not db_name:
        print("ERROR: MONGO_URL and DB_NAME must be set (in env or backend/.env).")
        sys.exit(1)

    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]

    existing_categories = await db.menu_categories.count_documents({})
    existing_items = sum(
        len(category.get("items", []))
        async for category in db.menu_categories.find({}, {"items": 1})
    )

    new_menu = build_menu()
    new_item_count = sum(len(category["items"]) for category in new_menu)

    print(f"Database:        {db_name}")
    print(f"Current state:   {existing_categories} categories, {existing_items} items")
    print(f"New state will:  {len(new_menu)} categories, {new_item_count} items")
    print()
    print("This will DROP db.menu_categories and re-insert the new structure.")
    print("Any items added manually via /admin/menu will be lost.")
    print()

    confirmation = input('Type "yes" to proceed: ').strip().lower()
    if confirmation != "yes":
        print("Aborted. No changes made.")
        return

    await db.menu_categories.drop()
    await db.menu_categories.insert_many(new_menu)

    final_categories = await db.menu_categories.count_documents({})
    final_items = sum(
        len(category.get("items", []))
        async for category in db.menu_categories.find({}, {"items": 1})
    )
    print(f"Done. Database now has {final_categories} categories and {final_items} items.")


if __name__ == "__main__":
    asyncio.run(main())
