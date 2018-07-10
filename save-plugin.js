window.addEventListener("load", function(event) {
  if (!('URL' in window && 'revokeObjectURL' in URL && 'createObjectURL' in URL)) {
    // Browser does not support import/export
    return;
  }

  var inputs = document.querySelectorAll('body > .grid-container > .grid-item input, body > .grid-container > .grid-item select');
  // To be replaced with initialization through document.getElementById()
  var importButton = document.createElement('input');
  var exportButton = document.createElement('a');
  var fileNamer = document.createElement('input');

  function collectAllChoices() {
    var data = [];
    inputs.forEach(function(input) {
      var value = input.value;

      // Did I mention how much I hate that every input type behave differently?
      if (input.type === 'checkbox') {
        value = input.checked;
      }

      data.push({
        id: input.id,
        value: value
      });
    });
    return data;
  }

  function fillAllChoices(choices) {
    choices.forEach(function(choice) {
      var input = document.getElementById(choice.id);

      if (input.type === 'checkbox') {
        input.checked = choice.value;
        return;
      }

      input.value = choice.value;
    });
    main();
  }

  function updateExportButton() {
    var name = fileNamer.value;
    var content = JSON.stringify({
      context: {
        name: name
      },
      choices: collectAllChoices()
    });
    var filename = name + '.json';
    var file = new Blob([content], {type: 'application/json'});
    window.URL.revokeObjectURL(exportButton.href); // Remove previous file from memory
    url = URL.createObjectURL(file);
    exportButton.href = url;
    exportButton.download = filename;
  }

  function loadFile() {
    var file = importButton.files[0];
    if (!file) {
      return;
    }
    var reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = function (event) {
      var data = JSON.parse(event.target.result);
      fileNamer.value = data.context.name;
      fillAllChoices(data.choices);
    }
  }

  /*
    This whole function, and its call, should burn in hell in favor of traditional HTML/CSS
    I just used it to reduce the overhead of installing the plugin during the testing phase
  */
  function createButtons(importButton, exportButton, fileNamer) {
    function randomId() {
      return Math.random().toString(36).substring(7);
    }

    var form = document.createElement('form');

    importButton.id = randomId();
    importButton.type = 'file';
    var importButtonLabel = document.createElement('label');
    importButtonLabel.textContent = "Import";
    importButtonLabel.setAttribute('for', importButton.id);

    exportButton.textContent = "Export";

    fileNamer.id = randomId();
    fileNamer.type = 'text';
    var fileNamerLabel = document.createElement('label');
    fileNamerLabel.textContent = "Export as";
    fileNamerLabel.setAttribute('for', fileNamer.id);

    form.appendChild(importButtonLabel);
    form.appendChild(importButton);
    form.appendChild(fileNamerLabel);
    form.appendChild(fileNamer);
    form.appendChild(exportButton);
    document.querySelector('header').appendChild(form);

    document.querySelector('header').style.height = 'auto';
    document.querySelector('header').style.paddingBottom = '20px';
    importButtonLabel.style.margin = '0 5px 0 10px';
    exportButton.style.fontSize = '20px';
    exportButton.style.margin = '0 5px 0 0';
    exportButton.style.fontStyle = 'italic';
    fileNamerLabel.style.margin = '0 5px 0 5px';
    fileNamer.style.margin = '0 10px 0 0';
    fileNamer.style.cursor = 'text';
  }
  createButtons(importButton, exportButton, fileNamer);

  fileNamer.value = "my-playthrough";
  updateExportButton();
  fileNamer.addEventListener('change', updateExportButton);
  // Probably a bit overkill to check everything everytime something is changed (memory?)
  inputs.forEach(function(input) {
    input.addEventListener('change', updateExportButton);
  });

  importButton.addEventListener('change', loadFile);
});
