
function startP() {
  document.getElementById('mic').classList.add('pulsate-css');
}

function stopP() {
  document.getElementById('mic').classList.remove('pulsate-css');
}

var langs =
[['Afrikaans',       ['af-ZA']],
 ['Bahasa Indonesia',['id-ID']],
 ['Bahasa Melayu',   ['ms-MY']],
 ['Català',          ['ca-ES']],
 ['Čeština',         ['cs-CZ']],
 ['Deutsch',         ['de-DE']],
 ['English',         ['en-AU', 'Australia'],
                     ['en-CA', 'Canada'],
                     ['en-IN', 'India'],
                     ['en-NZ', 'New Zealand'],
                     ['en-ZA', 'South Africa'],
                     ['en-GB', 'United Kingdom'],
                     ['en-US', 'United States']],
 ['Español',         ['es-AR', 'Argentina'],
                     ['es-BO', 'Bolivia'],
                     ['es-CL', 'Chile'],
                     ['es-CO', 'Colombia'],
                     ['es-CR', 'Costa Rica'],
                     ['es-EC', 'Ecuador'],
                     ['es-SV', 'El Salvador'],
                     ['es-ES', 'España'],
                     ['es-US', 'Estados Unidos'],
                     ['es-GT', 'Guatemala'],
                     ['es-HN', 'Honduras'],
                     ['es-MX', 'México'],
                     ['es-NI', 'Nicaragua'],
                     ['es-PA', 'Panamá'],
                     ['es-PY', 'Paraguay'],
                     ['es-PE', 'Perú'],
                     ['es-PR', 'Puerto Rico'],
                     ['es-DO', 'República Dominicana'],
                     ['es-UY', 'Uruguay'],
                     ['es-VE', 'Venezuela']],
 ['Euskara',         ['eu-ES']],
 ['Français',        ['fr-FR']],
 ['Galego',          ['gl-ES']],
 ['Hrvatski',        ['hr_HR']],
 ['IsiZulu',         ['zu-ZA']],
 ['Íslenska',        ['is-IS']],
 ['Italiano',        ['it-IT', 'Italia'],
                     ['it-CH', 'Svizzera']],
 ['Magyar',          ['hu-HU']],
 ['Nederlands',      ['nl-NL']],
 ['Norsk bokmål',    ['nb-NO']],
 ['Polski',          ['pl-PL']],
 ['Português',       ['pt-BR', 'Brasil'],
                     ['pt-PT', 'Portugal']],
 ['Română',          ['ro-RO']],
 ['Slovenčina',      ['sk-SK']],
 ['Suomi',           ['fi-FI']],
 ['Svenska',         ['sv-SE']],
 ['Türkçe',          ['tr-TR']],
 ['български',       ['bg-BG']],
 ['Pусский',         ['ru-RU']],
 ['Српски',          ['sr-RS']],
 ['한국어',            ['ko-KR']],
 ['中文',             ['cmn-Hans-CN', '普通话 (中国大陆)'],
                     ['cmn-Hans-HK', '普通话 (香港)'],
                     ['cmn-Hant-TW', '中文 (台灣)'],
                     ['yue-Hant-HK', '粵語 (香港)']],
 ['日本語',           ['ja-JP']],
 ['Lingua latīna',   ['la']]];

for (var i = 0; i < langs.length; i++) {
  from_select_language.options[i] = new Option(langs[i][0], i);
  to_select_language.options[i] = new Option(langs[i][0], i);
}
from_select_language.selectedIndex = 6;
to_select_language.selectedIndex = 6;
updateFromCountry();
updateToCountry();
from_select_dialect.selectedIndex = 6;
to_select_dialect.selectedIndex = 6;


function updateFromCountry() {
  for (var i = from_select_dialect.options.length - 1; i >= 0; i--) {
    from_select_dialect.remove(i);
  }
  var list_from = langs[from_select_language.selectedIndex];
  for (var i = 1; i < list_from.length; i++) {
    from_select_dialect.options.add(new Option(list_from[i][1], list_from[i][0]));
  }
  from_select_dialect.parentElement.style.display = list_from[1].length == 1 ? 'none' : 'inline-block';  
}

function updateToCountry() {
  for (var i = to_select_dialect.options.length - 1; i >= 0; i--) {
    to_select_dialect.remove(i);
  }
  var list_to = langs[to_select_language.selectedIndex];
  for (var i = 1; i < list_to.length; i++) {
    to_select_dialect.options.add(new Option(list_to[i][1], list_to[i][0]));
  }
  to_select_dialect.parentElement.style.display = list_to[1].length == 1 ? 'none' : 'inline-block';
  
}

var create_email = false;
var final_transcript = '';
var recognizing = false;
var ignore_onend;
var start_timestamp;
if (!('webkitSpeechRecognition' in window)) {
  upgrade();
} else {
  var recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = function() {
    recognizing = true;
    // speak now
  };

  recognition.onerror = function(event) {
    if (event.error == 'no-speech') {
      // no speech
      ignore_onend = true;
    }
    if (event.error == 'audio-capture') {
      // no microphone
      ignore_onend = true;
    }
    if (event.error == 'not-allowed') {
      if (event.timeStamp - start_timestamp < 100) {
        // info blocked
      } else {
        // info denied
      }
      ignore_onend = true;
    }
  };

  recognition.onend = function() {
    recognizing = false;
    if (ignore_onend) {
      return;
    }
    if (!final_transcript) {
      return;
    }
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
      var range = document.createRange();
      range.selectNode(document.getElementById('final_span'));
      window.getSelection().addRange(range);
    }
  };

  recognition.onresult = function(event) {
    // console.log(event);
    var interim_transcript = '';
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
        speak(final_transcript, event.target.lang, event.target.toLang);
        final_transcript = '';
        interim_transcript = '';
        return;
      } else {
        interim_transcript += event.results[i][0].transcript;
      }
    }
    final_span.innerHTML = final_transcript;
    interim_span.innerHTML = interim_transcript;
  };
}

function start(event) {
  startP();
  final_transcript = '';
  recognition.lang = from_select_dialect.value;
  recognition.toLang = to_select_dialect.value;
  recognition.start();
  ignore_onend = false;
  final_span.innerHTML = '';
  interim_span.innerHTML = '';
  start_timestamp = event.timeStamp;
}

function stop() {
  stopP();
  recognition.stop();
}

function speak(message, fromLang, toLang) {
  console.log(message, fromLang, toLang);
  const language = toLang.split('-')[0];

  apiRequest('/translate', {message, language})
  .then(res => {
    console.log(res.data)
    var msg = new SpeechSynthesisUtterance(res.data.text);
    msg.lang = toLang;
    window.speechSynthesis.speak(msg);
  })
  .catch(error => console.error(error))

}

function apiRequest(url, data) {
  return fetch(url, {
    body: JSON.stringify(data),
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'content-type': 'application/json'
    },
    method: 'POST',
    mode: 'cors'
  })
  .then(response => response.json())
}

function switchLanguages() {
  const fromSelectLanguage = from_select_language.selectedIndex;
  const toSelectLanguage = to_select_language.selectedIndex;
  const fromSelectDialect = from_select_dialect.selectedIndex;
  const toSelectDialect = to_select_dialect.selectedIndex;

  from_select_language.selectedIndex = toSelectLanguage;
  to_select_language.selectedIndex = fromSelectLanguage;
  updateFromCountry();
  updateToCountry();
  from_select_dialect.selectedIndex = toSelectDialect;
  to_select_dialect.selectedIndex = fromSelectDialect;

}
