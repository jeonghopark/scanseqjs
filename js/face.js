import { FaceLandmarker, FilesetResolver } from "./vision_bundle.mjs";

let faceLandmarker = null;
let videoElement = null;
let lastVideoTime = -1;

window.faceState = {
    happy: 0,
    sad: 0,
    surprised: 0,
    ready: false
};

window.faceAPI = {
    setVideoElement: function(el) {
        videoElement = el;
    }
};

async function initFaceLandmarker() {
    try {
        const vision = await FilesetResolver.forVisionTasks("./js/wasm");
        faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: "./models/face_landmarker.task"
            },
            runningMode: "VIDEO",
            numFaces: 1,
            outputFaceBlendshapes: true
        });
        window.faceState.ready = true;
        console.log("[face.js] FaceLandmarker ready");
        detectLoop();
    } catch (e) {
        console.warn("[face.js] FaceLandmarker init failed:", e);
    }
}

function detectLoop() {
    if (videoElement && videoElement.readyState >= 2 && videoElement.currentTime !== lastVideoTime) {
        lastVideoTime = videoElement.currentTime;
        const results = faceLandmarker.detectForVideo(videoElement, performance.now());

        if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
            const shapes = results.faceBlendshapes[0].categories;
            const get = (name) => {
                const s = shapes.find(b => b.categoryName === name);
                return s ? s.score : 0;
            };

            // Smooth values with simple lerp to avoid jitter
            const alpha = 0.2;
            window.faceState.happy    = window.faceState.happy    * (1 - alpha) + (get("mouthSmileLeft") + get("mouthSmileRight")) / 2 * alpha;
            window.faceState.sad      = window.faceState.sad      * (1 - alpha) + (get("mouthFrownLeft") + get("mouthFrownRight")) / 2 * alpha;
            window.faceState.surprised = window.faceState.surprised * (1 - alpha) + get("jawOpen") * alpha;
        }
    }
    requestAnimationFrame(detectLoop);
}

initFaceLandmarker();
