function getConfig() {
  return {
    CTCB: document.getElementById('CTCB').checked,
    INT_TD: document.getElementById('INT_TD').checked,
    INT_FD: document.getElementById('INT_FD').checked,
    INWLNTN: document.getElementById('INWLNTN').checked,
    MNUM: document.getElementById('MNUM').checked,
    INTENSITY: parseInt(document.getElementById('INTENSITY').value, 10)
  };
}

function randomizeNumbers(content, config) {
  function replacer(match) {
    let num = parseInt(match, 10);

    if (Math.random() * 100 > config.INTENSITY) {
      return match;
    }

    if (config.MNUM && Math.random() < 0.5) {
      return match;
    }

    if (0 <= num && num <= 10) {
      return String(Math.floor(Math.random() * 11));
    } else if (config.INT_TD && num >= 100 && num <= 999) {
      return String(Math.floor(Math.random() * 900) + 100);
    } else if (config.INT_FD && num >= 1000 && num <= 9999) {
      return String(Math.floor(Math.random() * 9000) + 1000);
    }

    return match;
  }

  content = content.replace(/\b\d+\b/g, replacer);

  if (config.INWLNTN) {
    content = content.replace(/([a-zA-Z]+)(\d+)/g, (match, letters, numbers) => {
      return letters + replacer(numbers);
    });
  }

  return content;
}

async function processContent() {
  const config = getConfig();
  let content = "";

  if (config.CTCB) {
    try {
      content = await navigator.clipboard.readText();
    } catch (err) {
      alert("Failed to access clipboard: " + err);
      return;
    }
  } else {
    const fileInput = document.getElementById('fileInput');
    if (!fileInput.files.length) {
      alert("Please select a file.");
      return;
    }
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
      content = e.target.result;
      finalize(content, config);
    };
    reader.readAsText(file);
    return;
  }

  finalize(content, config);
}

function finalize(content, config) {
  const updatedContent = randomizeNumbers(content, config);
  document.getElementById('output').textContent = updatedContent;

  if (config.CTCB) {
    navigator.clipboard.writeText(updatedContent).then(() => {
      alert("Modified content copied back to clipboard!");
    });
  }
}

function copyOutput() {
  const outputText = document.getElementById('output').textContent;
  if (!outputText.trim()) {
    alert("No content to copy!");
    return;
  }
  navigator.clipboard.writeText(outputText)
    .then(() => {
      alert("Output copied to clipboard!");
    })
    .catch((err) => {
      alert("Failed to copy output: " + err);
    });
}
