# Skill: Creative Writing & Image Prompting (Overriding Latent Bias)

Latest large language models and image generation models are heavily aligned (via RLHF/RL) towards generic, polished, symmetrical, and "professional" outputs. To produce truly creative writing and distinctive imagery, you must actively override these latent biases.

---

## 🎨 Image Prompting: Overriding Latent Bias

When translating a concept or image description into a generation prompt, you must actively counter the model's natural bias toward clean, centered, symmetrical studio portraits.

### 1. Spatial Geometry
Never use exact metric units (e.g., 35cm, 8mm). The model interprets these as literal text elements or averages them out. Replace them with descriptive physical camera behaviors:
*   **Avoid:** `"a portrait taken from 50cm away with an 85mm lens"`
*   **Use:** `"Extreme macro close-up,"` `"Pronounced barrel distortion,"` `"Warped wide-angle perspective."`

### 2. Expression Intensity
Do not just name the emotion (e.g., "pout," "angry"). Describe the physical muscle deformation, tension, and texture changes:
*   **Avoid:** `"a child pouting"`
*   **Use:** `"Cheeks ballooned with air, skin stretched smooth and tight across the jawline, lips pushed forward in a heavy pout."`

### 3. Prompt Hierarchy
Structure your image prompts strictly from **Macro to Micro** to guide the model's rendering sequence:
1.  **[Camera/Lens/Angle]** (e.g., *Warped wide-angle perspective, low-angle shot*)
2.  **[Composition/Bias Breakers]** (e.g., *Off-center composition, asymmetrical lighting, organic lens flare*)
3.  **[Subject Core & Expression]** (e.g., *A weathered explorer, brow furrowed deep, eyes squinting against harsh sunlight*)
4.  **[Environment]** (e.g., *Dust-choked desert background, heat distortion waves*)
5.  **[Fine Wardrobe Details/Jewelry]** (e.g., *Tattered leather collar, copper earring catching the light*)

---

## ✍️ Creative Writing Rules

To strip the generic, polished "AI voice" from prose:
*   **Show muscle, not adjectives:** Describe physical actions and environments instead of labeling them (e.g., instead of saying "he was nervous," describe the sweat pooling in the collar).
*   **Reject symmetry:** Write stories, scenes, and descriptions with deliberate imbalances, rough edges, and flaws.
*   **Specify the noise:** Focus on micro-details (dust, scratches, background chatter) that make a scene feel lived-in and real.
