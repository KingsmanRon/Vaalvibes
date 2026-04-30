// =============================================================================
// Vaal Vibes — Clear active promo codes and remove the legacy 20% pool.
//
// HOW TO RUN:
//   Option 1 — MongoDB Atlas web shell:
//     1. Atlas → your cluster → "Connect" → "MongoDB Shell".
//     2. use vaalvibes      // or whatever DB_NAME is set to
//     3. Paste this entire file and press Enter.
//
//   Option 2 — MongoDB Compass: open the MONGOSH tab, `use vaalvibes`, paste.
//
//   Option 3 — local CLI:
//     mongosh "<connection-string>/vaalvibes" \
//       --file backend/scripts/clear_active_promos.mongosh.js
//
// WHAT IT DOES (in order):
//   1. Prints every currently active promo code.
//   2. Prints every promo pool currently in the DB.
//   3. Revokes every active promo code (status -> "revoked", revoked_at = now).
//   4. Deletes the legacy "Welcome Gold 20%" pool by name.
//   5. Re-prints the post-state so you can verify.
//
// WHY revoke instead of delete the codes:
//   The audit log + redemption_logs reference promo IDs. Marking them revoked
//   preserves traceability while making them unredeemable. If you genuinely
//   want a hard delete, swap the updateMany call for a deleteMany (commented
//   below).
//
// IDEMPOTENT: yes — re-running on a clean DB is a no-op.
// =============================================================================

print("\n=== BEFORE: active promo codes ===");
db.promo_codes
  .find({ status: "active" }, { _id: 0, code: 1, user_id: 1, pool_id: 1, status: 1, issued_at: 1, expires_at: 1 })
  .sort({ issued_at: -1 })
  .forEach((doc) => printjson(doc));

const activeCount = db.promo_codes.countDocuments({ status: "active" });
print(`Total active codes: ${activeCount}`);

print("\n=== BEFORE: promo pools ===");
db.promo_pools
  .find({}, { _id: 0, id: 1, name: 1, discount_type: 1, discount_value: 1, min_spend: 1, active: 1 })
  .forEach((doc) => printjson(doc));

print("\n=== ACTION 1: revoke all active promo codes ===");
const revokeResult = db.promo_codes.updateMany(
  { status: "active" },
  { $set: { status: "revoked", revoked_at: new Date() } },
);
print(`Revoked ${revokeResult.modifiedCount} promo code(s).`);

// If you would rather hard-delete the codes (loses audit traceability), use:
//   const deleteResult = db.promo_codes.deleteMany({ status: { $in: ["active", "revoked"] } });
//   print(`Deleted ${deleteResult.deletedCount} promo code(s).`);

print("\n=== ACTION 2: delete legacy 20% pool ===");
const poolDelete = db.promo_pools.deleteMany({ name: "Welcome Gold 20%" });
print(`Deleted ${poolDelete.deletedCount} promo pool(s) named "Welcome Gold 20%".`);

// Optional: nuke ALL pools (uncomment if you want a clean slate):
//   const allPoolsDelete = db.promo_pools.deleteMany({});
//   print(`Deleted ${allPoolsDelete.deletedCount} promo pool(s) total.`);

print("\n=== AFTER: active promo codes ===");
const remainingActive = db.promo_codes.countDocuments({ status: "active" });
print(`Remaining active codes: ${remainingActive}`);

print("\n=== AFTER: promo pools ===");
db.promo_pools
  .find({}, { _id: 0, id: 1, name: 1, active: 1 })
  .forEach((doc) => printjson(doc));

print("\nDone.");
