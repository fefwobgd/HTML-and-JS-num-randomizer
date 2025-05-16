function getConfig() {
  const maxValInput = parseInt(document.getElementById('MAXVAL').value, 10);
  return {
    CTCB: document.getElementById('CTCB').checked,
    INT_TD: document.getElementById('INT_TD').checked,
    INT_FD: document.getElementById('INT_FD').checked,
    INWLNTN: document.getElementById('INWLNTN').checked,
    MNUM: document.getElementById('MNUM').checked,
    NOEXCEED: document.getElementById('NOEXCEED').checked,
    MAXVAL: isNaN(maxValInput) ? null : maxValInput,
    INTENSITY: parseInt(document.getElementById('INTENSITY').value, 10)
  };
}

function randomizeNumbers(content, config) {
  function boundedRandom(min, originalMax, categoryMax) {
    let max = categoryMax;
    if (config.NOEXCEED) {
      max = config.MAXVAL !== null ? Math.min(config.MAXVAL, originalMax) : originalMax;
    }
    if (max < min) return String(min); // fallback
    return String(Math.floor(Math.random() * (max - min + 1)) + min);
  }

  function replacer(match) {
    const num = parseInt(match, 10);
    if (Math.random() * 100 > config.INTENSITY) return match;
    if (config.MNUM && Math.random() < 0.5) return match;

    if (num <= 10) {
      return boundedRandom(0, num, 10);
    } else if (config.INT_TD && num >= 100 && num <= 999) {
      return boundedRandom(100, num, 999);
    } else if (config.INT_FD && num >= 1000 && num <= 9999) {
      return boundedRandom(1000, num, 9999);
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
      alert("Failed to read clipboard: " + err);
      return;
    }
  } else {
    const fileInput = document.getElementById('fileInput');
    if (!fileInput.files.length) {
      alert("Please select a file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
      finalize(e.target.result, config);
    };
    reader.readAsText(fileInput.files[0]);
    return;
  }

  finalize(content, config);
}

function finalize(content, config) {
  const updatedContent = randomizeNumbers(content, config);
  document.getElementById('output').textContent = updatedContent;

  if (config.CTCB) {
    navigator.clipboard.writeText(updatedContent).then(() => {
      alert("Modified content copied to clipboard!");
    });
  }
}

function copyOutput() {
  const text = document.getElementById('output').textContent;
  if (!text.trim()) {
    alert("Nothing to copy!");
    return;
  }
  navigator.clipboard.writeText(text).then(() => {
    alert("Output copied to clipboard!");
  });
}
