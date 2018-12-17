/**
 * jspsych-biat
 * Sarina Carter
 * 
 * modified from jspsych-iat
 * Kristin Diep
 **/


 jsPsych.plugins['biat-html'] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'biat-html',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The HTML string to be displayed.'
      },
      displayed_categories_key: {
        type: jsPsych.plugins.parameterType.HTML_STRING, 
        pretty_name: 'Displayed categories key',
        default: 'I',
        description: 'Key press that is associated with the displayed categories.'
      },
      notdisplayed_categories_key: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Not displayed categories key',
        default: 'E',
        description: 'Key press that is not associated with the diplayed categories.'
      },
      upper_category_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Upper category label',
        array: true,
        default: 'Upper',
        description: 'The label that is associated with the stimulus. Aligned to the upper edge of page.'
      },
      lower_category_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Lower category label',
        array: true,
        default: 'Lower',
        description: 'The label that is associated with the stimulus. Aligned to the lower edge of the page.'
      },
      key_to_move_forward: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Key to move forward',
        array: true,
        default: jsPsych.ALL_KEYS,
        description: 'The keys that allow the user to advance to the next trial if their key press was incorrect.'
      },
      display_feedback: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Display feedback',
        default: false,
        description: 'If true, then html when wrong will be displayed when user makes an incorrect key press.'
      },
      html_when_wrong: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'HTML when wrong',
        default: '<span style="color: red; font-size: 80px">X</span>',
        description: 'The image to display when a user presses the wrong key.'
      }, 
      bottom_instructions: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Bottom instructions',
        default: '<p>If you press the wrong key, a red X will appear. Press any key to continue.</p>',
        description: 'Instructions shown at the bottom of the page.'
      },
      force_correct_key_press: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Force correct key press',
        default: false,
        description: 'If true, in order to advance to the next trial after a wrong key press the user will be forced to press the correct key.'
      },
      stim_key_association: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Stimulus key association',
        options: ['E', 'I'],
        default: 'undefined',
        description: 'Stimulus will be associated with "E" or "I".'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, trial will end when user makes a response.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show the trial.'
      },
    }
  }


  plugin.trial = function(display_element, trial) {

    var html_str = "";

    html_str += "<div id='jspsych-iat-stim'>" + trial.stimulus + "</div>";
    
    html_str += "";

    html_str += "Press " + trial.displayed_categories_key + " for:<br> " +
    trial.upper_category_label.bold() + "<br>" + "or<br>" +
    trial.lower_category_label.bold() + "</div>";
  

    html_str += "<div id='wrongImgID'>";

    if(trial.display_feedback === true) {
      html_str += "<div id='wrongImgContainer' style='visibility: hidden; </div>";
      html_str += "<div>"+trial.bottom_instructions+"</div>";
    } else {
      html_str += "<div>"+trial.bottom_instructions+"</div>";
    }

    html_str += "</div>";

    display_element.innerHTML = html_str;


    // store response
    var response = {
      rt: null,
      key: null,
      correct: false
    };

    // function to end trial when it is time
    var end_trial = function() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "key_press": response.key,
        "correct": response.correct
      };

      // clears the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    var displayedKeyCode = jsPsych.pluginAPI.convertKeyCharacterToKeyCode(trial.displayed_categories_key);
    var notdisplayedKeyCode = jsPsych.pluginAPI.convertKeyCharacterToKeyCode(trial.notdisplayed_categories_key);

    // function to handle responses by the subject
    var after_response = function(info) {
      var wImg = document.getElementById("wrongImgContainer");
      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector('#jspsych-iat-stim').className += ' responded';

      // only record the first response
      if (response.key == null ) {
        response = info;
      }

      if(trial.stim_key_association == trial.notdisplayed_categories_key) {
        if(response.rt !== null && response.key == notdisplayedKeyCode) {
          response.correct = true;
          if (trial.response_ends_trial) {
            end_trial();
          }
        } else {
          response.correct = false;
          if(!trial.response_ends_trial && trial.display_feedback == true) {
            wImg.style.visibility = "visible";
          }
          if (trial.response_ends_trial && trial.display_feedback == true) {
            wImg.style.visibility = "visible";
            if(trial.force_correct_key_press) {
              var keyListener = jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: end_trial,
                valid_responses: [trial.notdisplayed_categories_key]
              });
            } else {
            var keyListener = jsPsych.pluginAPI.getKeyboardResponse({
              callback_function: end_trial,
              valid_responses: trial.key_to_move_forward
            });}
           } else if(trial.response_ends_trial && trial.display_feedback != true) {
            var keyListener = jsPsych.pluginAPI.getKeyboardResponse({
              callback_function: end_trial,
              valid_responses: [jsPsych.ALL_KEYS]
            });
          } else if(!trial.response_ends_trial && trial.display_feedback != true) {

          }
        }
      } else if(trial.stim_key_association == trial.displayed_categories_key) {
        if(response.rt !== null && response.key == displayedKeyCode) {
          response.correct = true;
          if (trial.response_ends_trial) {
            end_trial();
          }
        } else {
          response.correct = false;
          if(!trial.response_ends_trial && trial.display_feedback == true) {
            wImg.style.visibility = "visible";
          }
          if (trial.response_ends_trial && trial.display_feedback == true) {
            wImg.style.visibility = "visible";
            if(trial.force_correct_key_press) {
              var keyListener = jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: end_trial,
                valid_responses: [trial.displayed_categories_key]
              });
            } else {
            var keyListener = jsPsych.pluginAPI.getKeyboardResponse({
              callback_function: end_trial,
              valid_responses: trial.key_to_move_forward
            });}
          } else if(trial.response_ends_trial && trial.display_feedback != true) {
            var keyListener = jsPsych.pluginAPI.getKeyboardResponse({
              callback_function: end_trial,
              valid_responses: [jsPsych.ALL_KEYS]
            });
          } else if(!trial.response_ends_trial && trial.display_feedback != true) {

          }
        }
      }
    };

    // start the response listener
    if (trial.displayedKeyCode != jsPsych.NO_KEYS && trial.notdisplayedKeyCode != jsPsych.NO_KEYS) {
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: [trial.displayed_categories_key, trial.notdisplayed_categories_key],
        rt_method: 'date',
        persist: false,
        allow_held_key: false
      });
    }

    // end trial if time limit is set
    if (trial.trial_duration !== null && trial.response_ends_trial != true) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }

  };

  return plugin;
})();
