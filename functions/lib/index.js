"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePopularityScores = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
const db = admin.firestore();
// Scheduled function to recalc popularity scores every hour
exports.calculatePopularityScores = functions.pubsub
    .schedule("every 1 hours")
    .onRun(async () => {
    const artworksRef = db.collection("artworks");
    const snapshot = await artworksRef.get();
    if (snapshot.empty) {
        console.log("No artworks found.");
        return null;
    }
    const batch = db.batch();
    snapshot.forEach((doc) => {
        var _a, _b;
        const artwork = doc.data();
        const metrics = artwork.metrics || { likes: 0, views: 0 };
        // Assumes you have a 'createdAt' Firestore Timestamp; fallback to now
        // to avoid NaN.
        const createdAt = ((_b = (_a = artwork.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a)) || new Date();
        // --- Scoring Formula ---
        const points = (metrics.likes || 0) * 2 + (metrics.views || 0) * 0.5;
        const hoursSinceCreation = (Date.now() - createdAt.getTime()) / 3600000;
        const gravity = 1.8; // Gravity factor
        const score = points / Math.pow(hoursSinceCreation + 2, gravity);
        // -----------------------
        const artworkRefToUpdate = artworksRef.doc(doc.id);
        batch.update(artworkRefToUpdate, { popularityScore: score });
    });
    await batch.commit();
    console.log(`Updated popularity scores for ${snapshot.size} artworks.`);
    return null;
});
//# sourceMappingURL=index.js.map