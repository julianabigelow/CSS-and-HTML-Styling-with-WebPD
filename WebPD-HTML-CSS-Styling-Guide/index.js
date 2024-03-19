const frequency = document.querySelector("#freqSlider");
const volume = document.querySelector("#volumeSlider");
const noteTrigger = document.querySelector("#triggerNote");
 
frequencyNodeID = "n_0_1";
volumeNodeID = "n_0_7";
noteTriggerNodeID = "n_0_9";
 
 
frequency.oninput = function (e) {
    const value = e.target.value;
    sendMsgToWebPd(frequencyNodeID, "0", [Number(value)]);
  };
  
volume.oninput = function (e) {
    const value = e.target.value;
    sendMsgToWebPd(volumeNodeID, "0", [Number(value)]);
};
  
noteTrigger.onclick = function () {
    sendMsgToWebPd(noteTriggerNodeID, "0", ["bang"]);
  };
 

 // Here is an index of objects IDs to which you can send messages, with hints so you can find the right ID.
            // Note that by default only GUI objects (bangs, sliders, etc ...) are available.
            //  - nodeId "n_0_1" portletId "0"
            //      * type "floatatom"
            //      * position [53,93]
            //      * label "frequency"
            
            //  - nodeId "n_0_3" portletId "0"
            //      * type "msg"
            //      * position [145,118]
            
            //  - nodeId "n_0_6" portletId "0"
            //      * type "msg"
            //      * position [224,135]
            
            //  - nodeId "n_0_7" portletId "0"
            //      * type "floatatom"
            //      * position [145,61]
            //      * label "volume-sustian"
            
            //  - nodeId "n_0_9" portletId "0"
            //      * type "bng"
            //      * position [224,101]
            //      * label "trigger-note"
 
 
const freqSlider = document.getElementById("freqSlider");
const freqOutput = document.getElementById("freqValue");
freqSlider.innerHTML = freqOutput.value; // Display the default slider value

const volumeSlider = document.getElementById("volumeSlider");
const volumeOutput = document.getElementById("volumeValue");
volumeSlider.innerHTML = volumeOutput.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
  output.innerHTML = this.value;          