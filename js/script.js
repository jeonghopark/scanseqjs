var capture;

var buff;
var lineNum = 20;
var linesColor = [lineNum];

var linesXPos = [lineNum];
var linesMovSpeed = [lineNum];
var linesTrigger = [lineNum];
var linesOldSum = [lineNum];

var waveMoving = [lineNum];
var waveMovingFactor = [lineNum];
var waveMovingSpeed = [lineNum];
var waveMovingDec = [lineNum];

var polySynth;
var linesToneTrigger = [lineNum];

var startPostion;

var noteListWhole = [
"C3", "E3", "D3", "G#4", "F#4", "C4", "A#4", "D4", "F#4", "E4",
"A#4", "G#4", "D5", "C5", "F#5", "E5", "A#5", "G#5", "C6", "D6"
];


var cameraScreenRatio;

function setup() {
}

function setup() {

    var reverb = new Tone.JCReverb(0.9).connect(Tone.Master);
    var delay = new Tone.FeedbackDelay(0.6); 

    polySynth = new Tone.PolySynth(6, Tone.Synth);
    var vol = new Tone.Volume(-28);
    // polySynth.chain(delay, reverb);
    polySynth.chain(vol, reverb).chain(vol, delay).chain(vol, Tone.Master);

    createCanvas(1100, 600);
    var constraints = {
        audio: false,
        video: {
            facingMode: "user"
        }
    };
    capture = createCapture(constraints);
    
    // capture = createCapture(VIDEO);
    capture.size(320, 240);
    // capture.hide();
    cameraScreenRatio = 600 / 240;

    buff = createImage(80, 240);

    startPostion = 80 * cameraScreenRatio;

    for (var i = 0; i < lineNum; i++) {
        linesXPos[i] = startPostion;
        linesMovSpeed[i] = 0.0;
        linesTrigger[i] = false;
        linesToneTrigger[i] = false;
        linesOldSum[i] = 0.0;
        waveMovingFactor[i] = 0.0;
        waveMovingSpeed[i] = 0.0;
        waveMovingDec[i] = 0.0;
    }
}


function draw() {
    background(0);

    capture.loadPixels();
    buff.loadPixels();

    for (var y = 0; y < capture.height; y++) {
        for (var x = 0; x < capture.width; x++) {
            if (x < 80) {
                var i = y * capture.width + (capture.width - 1 - x);
                var _c = [capture.pixels[i * 4 + 0], capture.pixels[i * 4 + 1], capture.pixels[i * 4 + 2], 255];
                buff.set(x, y, _c);
            }
        }
    }

    for(var i=0; i<lineNum; i++){
        var _index = (i + 0.5) * capture.height / lineNum * capture.width - 80;
        linesColor[i] = [capture.pixels[_index * 4 + 0], capture.pixels[_index * 4 + 1], capture.pixels[_index * 4 + 2], 255];
    }

    buff.updatePixels();


    for (var i = 0; i < lineNum; i++) {
        stroke(linesColor[i]);
        strokeWeight(height / lineNum * 0.5);
        line(80 * cameraScreenRatio, (i + 0.5) * height / lineNum, width, (i + 0.5) * height / lineNum);

        
        fill((255-linesColor[i][0],255-linesColor[i][1],255-linesColor[i][2]));
        noStroke();

        var _colorValueSum = (linesColor[i][0] + linesColor[i][1] + linesColor[i][2]) / 3.0;
        var _diffColorValue = abs(_colorValueSum - linesOldSum[i])
        if (_diffColorValue > 40) {
            linesTrigger[i] = true;
            linesOldSum[i] = _colorValueSum;

            if (linesToneTrigger[i] === true) {
                // polySynth.triggerAttackRelease(noteListWhole[19 - i], "8t");
                linesToneTrigger[i] = false;
            }
        } 

        if (linesXPos[i] > (width + startPostion) * 0.5 && linesToneTrigger[i] === false) {
            waveMoving[i] = true;
            linesTrigger[i] = true;
            linesToneTrigger[i] = true;
            if (linesToneTrigger[i] === true) {
                polySynth.triggerAttackRelease(noteListWhole[19-i], "8t");
            }
        }

        if (linesXPos[i] > width) {
            linesXPos[i] = startPostion;
            linesTrigger[i] = false;
            linesToneTrigger[i] = true;
        }

        if (linesTrigger[i] === true) {
            linesMovSpeed[i] = 10.0;
        } else {
            linesXPos[i] = startPostion;
            linesMovSpeed[i] = 0.0;
        }
        
        linesXPos[i] = linesXPos[i] + linesMovSpeed[i];
        ellipse(linesXPos[i], (i + 0.5) * height / lineNum, 10, 10);

    }


    push();
    stroke(255, 180);
    strokeWeight(2);
    noFill();
    beginShape();
    curveVertex((width + startPostion) * 0.5, (0.0) * height / lineNum);
    curveVertex((width + startPostion) * 0.5, (0.0) * height / lineNum);
    for (var i = 0; i < lineNum; i++) {
        if (waveMoving[i] === true) {
            waveMovingSpeed[i] = 0.7;
            waveMoving[i] = false;
            waveMovingFactor[i] = 0.0;
            waveMovingDec[i] = 0.9;
        }
        waveMovingFactor[i] += waveMovingSpeed[i];
        waveMovingDec[i] *= 0.98;

        let _movingX;
        if (i === 0) {
            _movingX = sin(waveMovingFactor[i]) * 0.5 * waveMovingDec[i] * 30.0;
            curveVertex((width + startPostion) * 0.5 + _movingX, (i + 0.5) * height / lineNum);
        } else if (i > 0 && i < lineNum - 1) {
            _movingX = (sin(waveMovingFactor[i]) + sin(waveMovingFactor[i+1]) * 0.75 + sin(waveMovingFactor[i-1]) * 0.75) * waveMovingDec[i] * 30.0;
            curveVertex((width + startPostion) * 0.5 + _movingX, (i + 0.5) * height / lineNum);
        } else {
            _movingX = sin(waveMovingFactor[i]) * 0.5 * waveMovingDec[i] * 30.0;
            curveVertex((width + startPostion) * 0.5 + _movingX, (i + 0.5) * height / lineNum);
        }
    }
    curveVertex((width + startPostion) * 0.5, (lineNum + 0.0) * height / lineNum);
    curveVertex((width + startPostion) * 0.5, (lineNum + 0.0) * height / lineNum);
    endShape();
    pop();


    push();
    stroke(255, 70);
    strokeWeight(1);
    // line(startPostion, 0, startPostion, height);
    line((width + startPostion) * 0.5, 0, (width + startPostion) * 0.5, height);
    pop();

    push();
    translate(0, 0);
    image(buff, 0, 0, startPostion, 240 * cameraScreenRatio);
    pop();

}