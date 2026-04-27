// =============================================================================
// Vaal Vibes — One-time menu sync to April 2026 prices.
//
// HOW TO RUN:
//   Option 1 (fastest) — MongoDB Atlas web shell:
//     1. Atlas dashboard → your cluster → "Connect" → "MongoDB Shell" → open
//        the embedded shell (or use the "..." menu → "Open MongoDB Shell").
//     2. Switch to your DB:        use vaalvibes        // (or whatever DB_NAME is)
//     3. Paste this entire file and press Enter.
//
//   Option 2 — MongoDB Compass:
//     1. Open Compass → connect to your cluster.
//     2. Open the "MONGOSH" tab at the bottom.
//     3. use vaalvibes
//     4. Paste this file and press Enter.
//
//   Option 3 — local mongosh CLI:
//     mongosh "<your-connection-string>/vaalvibes" --file backend/scripts/sync_menu_2026_04.mongosh.js
//
// WHAT IT DOES:
//   * Drops db.menu_categories.
//   * Re-inserts the new April 2026 menu (15 categories, ~50 items).
//
// WHAT IT DOES NOT DO:
//   * Touch any other collection (customers, events, gallery, admins, etc.).
//   * Affect any file in frontend/public/.
//
// IDEMPOTENT: yes — re-running produces the same end state.
// REVERSIBLE: yes (sort of) — the next backend redeploy on an empty
//             menu_categories will re-seed defaults from server.py.
// =============================================================================

(function () {
  const u = () => crypto.randomUUID();

  function item(name, description, price, price_label, category, subcategory, opts) {
    opts = opts || {};
    return {
      id: u(),
      name: name,
      description: description,
      price: price,
      price_label: price_label,
      category: category,
      subcategory: subcategory || "",
      featured: !!opts.featured,
      tags: opts.tags || [],
      image_url: null,
    };
  }

  function category(name, slug, description, items) {
    return {
      id: u(),
      name: name,
      slug: slug,
      description: description,
      items: items,
    };
  }

  const newMenu = [
    category("Food", "food", "Braai platters, plates, and sides.", [
      item("Peckish", "Serves 2-4. 200g Chuck, 200g Wors, 200g Chicken Wings and 200g Liver. Served with pap, chakalaka and salsa.", 250, "R250.00", "Food", "Platters", { featured: true, tags: ["share", "popular"] }),
      item("Hungry", "Serves 2-4. 200g Chuck, 300g Wors, 400g Chicken Wings, 300g Liver and 200g Ribs. Served with pap, chakalaka and salsa.", 400, "R400.00", "Food", "Platters", { featured: true, tags: ["house-special"] }),
      item("Die Man", "Serves 4-6. 400g Chuck, 300g Wors, 500g Chicken Wings and 500g Liver. Served with pap, chakalaka and salsa.", 450, "R450.00", "Food", "Platters", { tags: ["platter"] }),
      item("Die Groot Man", "Serves 6-8. 500g Chuck, 500g Wors, 500g Chicken Wings, 500g Ribs and 500g Liver. Served with pap, chakalaka and salsa.", 700, "R700.00", "Food", "Platters", { tags: ["group"] }),
      item("Chuck Plate", "200g Chuck with pap, chakalaka and salsa.", 90, "R90.00", "Food", "Plates"),
      item("Liver Plate", "200g Liver with pap, chakalaka and salsa.", 60, "R60.00", "Food", "Plates"),
      item("Chicken Wings Plate", "3 chicken wings with pap, chakalaka and salsa.", 70, "R70.00", "Food", "Plates"),
      item("Wors Plate", "300g Wors with pap, chakalaka and salsa.", 80, "R80.00", "Food", "Plates"),
      item("Pap", "Side portion.", 15, "R15.00", "Food", "Extras"),
      item("Chakalaka", "Side portion.", 15, "R15.00", "Food", "Extras"),
      item("Salsa", "Side portion.", 15, "R15.00", "Food", "Extras"),
    ]),
    category("Cocktails", "cocktails", "Signature cocktails and premium mixers.", [
      item("Long Island", "Classic long island blend.", 110, "R110.00", "Cocktails", "Classics", { featured: true }),
      item("Margarita", "Fresh lime and tequila.", 90, "R90.00", "Cocktails", "Classics"),
      item("Mai Tai", "Dark rum and citrus.", 90, "R90.00", "Cocktails", "Classics"),
      item("Strawberry Daiquiri", "Frozen strawberry daiquiri.", 80, "R80.00", "Cocktails", "Frozen"),
      item("Mojito", "Mint, lime, and rum.", 70, "R70.00", "Cocktails", "Classics"),
      item("Polloma", "Tequila and grapefruit fizz.", 70, "R70.00", "Cocktails", "Classics"),
      item("Sunset Orange G&T", "Bright citrus gin and tonic.", 50, "R50.00", "Cocktails", "G&T"),
      item("Pink Berry G&T", "Berry-forward gin and tonic.", 50, "R50.00", "Cocktails", "G&T"),
    ]),
    category("Vodka", "vodka", "Vodka bottle service.", [
      item("Belvedere", "Bottle.", 1000, "R1000", "Vodka", "Bottle", { tags: ["premium"] }),
      item("Smirnoff 1818", "Bottle.", 350, "R350", "Vodka", "Bottle"),
      item("Absolut", "Bottle.", 650, "R650", "Vodka", "Bottle"),
    ]),
    category("Gin", "gin", "Gin bottle service.", [
      item("Tanqueray", "Bottle.", 650, "R650", "Gin", "Bottle"),
      item("Tanqueray 10", "Bottle.", 1000, "R1000", "Gin", "Bottle", { tags: ["premium"] }),
      item("Gordons", "Bottle.", 350, "R350", "Gin", "Bottle"),
      item("Hendricks", "Bottle. Shot R35.", 800, "R800", "Gin", "Bottle"),
      item("Inverroche", "Bottle.", 800, "R800", "Gin", "Bottle"),
    ]),
    category("Tequila", "tequila", "Tequila bottle service.", [
      item("Jose Cuervo", "Bottle.", 650, "R650", "Tequila", "Bottle"),
      item("Don Julio Blanco", "Bottle.", 1500, "R1500", "Tequila", "Bottle", { tags: ["premium"] }),
      item("Don Julio Reposado", "Bottle. Shot R70.", 2000, "R2000", "Tequila", "Bottle", { tags: ["premium"] }),
      item("Don Julio 1942", "Bottle. Ultra-premium.", 10000, "R10 000", "Tequila", "Bottle", { featured: true, tags: ["premium", "ultra"] }),
    ]),
    category("Whiskey", "whiskey", "Whiskey bottle service.", [
      item("Glenfiddich 12", "Bottle. Shot R50.", 1600, "R1600", "Whiskey", "Bottle", { tags: ["premium"] }),
      item("Jameson Select", "Bottle.", 1000, "R1000", "Whiskey", "Bottle"),
      item("Johnnie Walker Blue", "Bottle. Premium blend.", 6000, "R6000", "Whiskey", "Bottle", { featured: true, tags: ["premium"] }),
    ]),
    category("Cognac", "cognac", "Cognac bottle service.", [
      item("Hennessy VS", "Bottle. Shot R40.", 1100, "R1100", "Cognac", "Hennessy", { featured: true }),
      item("Hennessy VSOP", "Bottle.", 1800, "R1800", "Cognac", "Hennessy", { tags: ["premium"] }),
      item("Hennessy XO", "Bottle.", 6000, "R6000", "Cognac", "Hennessy", { tags: ["premium"] }),
      item("Martell VS", "Bottle. Shot R40.", 1100, "R1100", "Cognac", "Martell"),
      item("Martell Blue Swift", "Bottle.", 1800, "R1800", "Cognac", "Martell", { tags: ["premium"] }),
      item("Courvoisier", "Bottle.", 1100, "R1100", "Cognac", "Courvoisier"),
      item("Remy Martin VS", "Bottle. Shot R50.", 1300, "R1300", "Cognac", "Remy Martin"),
      item("Remy Martin VSOP", "Bottle.", 2000, "R2000", "Cognac", "Remy Martin", { tags: ["premium"] }),
      item("Remy Martin 1738", "Bottle.", 3200, "R3200", "Cognac", "Remy Martin", { tags: ["premium"] }),
      item("Remy Martin XO", "Bottle.", 6500, "R6500", "Cognac", "Remy Martin", { tags: ["premium"] }),
    ]),
    category("Liquor", "liquor", "Herbal and specialty liquors.", [
      item("Jagermeister", "Bottle. Shot R30.", 650, "R650", "Liquor", "Bottle"),
    ]),
    category("Brandy", "brandy", "Brandy bottle service.", [
      item("Richelieu", "Bottle. Shot R20.", 500, "R500", "Brandy", "Bottle"),
    ]),
    category("Shots", "shots", "Shot specials.", [
      item("Jager Bomb", "Comes in 2s.", 70, "R70", "Shots", "Specials", { featured: true }),
    ]),
    category("Champagne", "champagne", "Champagne and prestige bottles.", [
      item("Veuve Clicquot Yellow Label Brut", "Bottle.", 1500, "R1500", "Champagne", "Veuve Clicquot", { featured: true }),
      item("Veuve Clicquot Rich", "Bottle.", 1800, "R1800", "Champagne", "Veuve Clicquot", { tags: ["premium"] }),
      item("Moet & Chandon Nectar Imperial", "Bottle.", 1800, "R1800", "Champagne", "Moet & Chandon", { tags: ["premium"] }),
      item("G.H. Mumm", "Bottle.", 1400, "R1400", "Champagne", "Mumm"),
      item("Ace of Spades", "Bottle. Ultra-premium.", 8000, "R8000", "Champagne", "Armand de Brignac", { featured: true, tags: ["premium", "ultra"] }),
    ]),
    category("Beers", "beers", "Lagers and easy-pour bottles.", [
      item("Corona", "Imported lager.", 35, "R35", "Beers", "Lager"),
      item("Heineken", "Premium lager.", 30, "R30", "Beers", "Lager"),
      item("Castle Light", "SA light lager.", 30, "R30", "Beers", "Lager"),
      item("Carling Black Label", "SA classic lager.", 30, "R30", "Beers", "Lager"),
      item("Heineken Silver", "Crisp light lager.", 20, "R20", "Beers", "Lager"),
      item("Windhoek", "Smooth Namibian lager.", 35, "R35", "Beers", "Lager"),
    ]),
    category("Ciders", "ciders", "Ciders and sparkling coolers.", [
      item("Ice Tropez", "Sparkling cooler.", 100, "R100", "Ciders", "Cooler", { featured: true }),
      item("Savannah", "Crisp apple cider.", 35, "R35", "Ciders", "Cider"),
      item("Bernini Blush", "Light sparkling cider.", 30, "R30", "Ciders", "Cider"),
      item("Other Ciders", "Hunters, Strongbow, etc.", 30, "R30", "Ciders", "Cider"),
    ]),
    category("Wines", "wines", "Wines and rose.", [
      item("Chateau", "House selection.", 35, "R35", "Wines", "Wine"),
      item("Rupert & Rothschild", "Premium red.", 450, "R450", "Wines", "Wine", { tags: ["premium"] }),
    ]),
    category("Refreshers", "refreshers", "Soft drinks, waters, mixers, and energy drinks.", [
      item("Sparkling Water 500ml", "Sparkling water.", 20, "R20.00", "Refreshers", "Water"),
      item("Still Water 500ml", "Still water.", 20, "R20.00", "Refreshers", "Water"),
      item("Coke 200ml", "Classic Coke.", 20, "R20.00", "Refreshers", "Soft Drinks"),
      item("Sprite 300ml", "Lemon-lime soda.", 25, "R25.00", "Refreshers", "Soft Drinks"),
      item("Appletiser 1.25L", "Sparkling apple juice.", 70, "R70.00", "Refreshers", "Soft Drinks"),
      item("Redbull 250ml", "Energy drink.", 40, "R40.00", "Refreshers", "Energy"),
    ]),
  ];

  const beforeCategories = db.menu_categories.countDocuments({});
  const beforeItems = db.menu_categories.aggregate([
    { $project: { count: { $size: { $ifNull: ["$items", []] } } } },
    { $group: { _id: null, total: { $sum: "$count" } } },
  ]).toArray()[0];
  const beforeItemCount = beforeItems ? beforeItems.total : 0;

  print("Before:  " + beforeCategories + " categories, " + beforeItemCount + " items");

  db.menu_categories.drop();
  db.menu_categories.insertMany(newMenu);

  const afterCategories = db.menu_categories.countDocuments({});
  const afterItems = db.menu_categories.aggregate([
    { $project: { count: { $size: { $ifNull: ["$items", []] } } } },
    { $group: { _id: null, total: { $sum: "$count" } } },
  ]).toArray()[0];
  const afterItemCount = afterItems ? afterItems.total : 0;

  print("After:   " + afterCategories + " categories, " + afterItemCount + " items");
  print("Done.");
})();
