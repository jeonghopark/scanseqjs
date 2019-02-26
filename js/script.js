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


function preload(){

}


function setup() {

    createCanvas(1100, 600);

    let reverb = new Tone.JCReverb(0.9).connect(Tone.Master);
    let delay = new Tone.FeedbackDelay(0.6); 

    polySynth = new Tone.PolySynth(6, Tone.Synth);
    let vol = new Tone.Volume(-28);
    // polySynth.chain(delay, reverb);
    polySynth.chain(vol, reverb).chain(vol, delay).chain(vol, Tone.Master);


    // let constraints = {
    //     audio: false,
    //     video: {
    //         facingMode: "user"
    //     }
    // };
    // capture = createCapture(constraints);
    
    capture = createCapture(VIDEO);
    capture.size(320, 240);
    // capture.hide();
    cameraScreenRatio = 600 / 240;

    buff = createImage(80, 240);

    startPostion = 80 * cameraScreenRatio;

    for (let i = 0; i < lineNum; i++) {
        linesXPos.push(startPostion);
        linesMovSpeed.push(0.0);
        linesTrigger.push(false);
        linesToneTrigger.push(false);
        linesOldSum.push(0.0);
        waveMovingFactor.push(0.0);
        waveMovingSpeed.push(0.0);
        waveMovingDec.push(0.0);
    }
}


function draw() {
    
    background(0);

    trigger();
    lineColorCapture();

    pathLineDraw();
    ellipseMoving();
    waveLineDraw();

    push();
    stroke(255, 70);
    strokeWeight(1);
    line(startPostion, 0, startPostion, height);
    line((width + startPostion) * 0.5, 0, (width + startPostion) * 0.5, height);
    pop();

    push();
    translate(0, 0);
    image(buffImageUpdate(capture), 0, 0, startPostion, 240 * cameraScreenRatio);
    pop();

}



var buffImageUpdate = function(_capture){

    _capture.loadPixels();
    buff.loadPixels();

    for (let y = 0; y < _capture.height; y++) {
        for (let x = 0; x < _capture.width; x++) {
            if (x < 80) {
                let i = y * _capture.width + (_capture.width - 1 - x);
                let _c = [_capture.pixels[i * 4 + 0], _capture.pixels[i * 4 + 1], _capture.pixels[i * 4 + 2], 255];
                buff.set(x, y, _c);
            }
        }
    }

    buff.updatePixels();

    return buff;
};



function lineColorCapture(){
    for (let i = 0; i < lineNum; i++) {
        let _index = (i + 0.5) * capture.height / lineNum * capture.width - 80;
        linesColor[i] = [capture.pixels[_index * 4 + 0], capture.pixels[_index * 4 + 1], capture.pixels[_index * 4 + 2], 255];
    }    
}


function pathLineDraw(){

    push();
    for (let i = 0; i < linesColor.length; i++) {
        stroke(linesColor[i]);
        strokeWeight(height / lineNum * 0.5);
        line(80 * cameraScreenRatio, (i + 0.5) * height / lineNum, width, (i + 0.5) * height / lineNum);
    }
    pop();

}


function trigger(){

    for (let i = 0; i < linesColor.length; i++) {
        let _colorValueSum = (linesColor[i][0] + linesColor[i][1] + linesColor[i][2]) / 3.0;
        let _diffColorValue = abs(_colorValueSum - linesOldSum[i])
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
                polySynth.triggerAttackRelease(noteListWhole[19-i], "16t");
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
        
    }

}



function ellipseMoving(){ 
    
    push();
    noStroke();
    for (let i = 0; i < linesColor.length; i++) {
        linesXPos[i] = linesXPos[i] + linesMovSpeed[i];
        fill((255-linesColor[i][0],255-linesColor[i][1],255-linesColor[i][2]));
        ellipse(linesXPos[i], (i + 0.5) * height / lineNum, 10, 10);
    }
    pop();
}



function waveLineDraw(){

    push();
    stroke(255, 180);
    strokeWeight(2);
    noFill();

    beginShape();
    curveVertex((width + startPostion) * 0.5, (0.0) * height / lineNum);
    curveVertex((width + startPostion) * 0.5, (0.0) * height / lineNum);
    for (let i = 0; i < lineNum; i++) {
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

}