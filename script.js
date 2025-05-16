function getConfig() {
  const maxValInput = parseInt(document.getElementById('MAXVAL').value, 10);
  return {
    CTCB: document.getElementById('CTCB').checked,
    INT_TD: document.getElementById('INT_TD').checked,
    INT_FD: document.getElementById('INT_FD').checked,
    ANYNUM: document.getElementById('ANYNUM').checked,
    INWLNTN: document.getElementById('INWLNTN').checked,
    MNUM: document.getElementById('MNUM').checked,
    NOEXCEED: document.getElementById('NOEXCEED').checked,
    MAXVAL: isNaN(maxValInput) ? null : BigInt(maxValInput),
    INTENSITY: parseInt(document.getElementById('INTENSITY').value, 10)
  };
}

function randomizeNumbers(content, config) {
  function generateRandomBigInt(min, max) {
    const range = max - min + BigInt(1);
    const rangeNum = Number(range);
    if (isNaN(rangeNum) || rangeNum <= 0) return min;
    return min + BigInt(Math.floor(Math.random() * rangeNum));
  }

  function replacer(match) {
    const originalStr = match;
    const numDigits = originalStr.length;
    let originalNum;

    try {
      originalNum = BigInt(originalStr);
    } catch {
      return originalStr; // fallback if too large or invalid
    }

    if (Math.random() * 100 > config.INTENSITY) return originalStr;
    if (config.MNUM && Math.random() < 0.5) return originalStr;

    let min = BigInt(0);
    let max = BigInt(9).toString().repeat(numDigits);
    try {
      max = BigInt(max);
    } catch {
      max = BigInt("9".repeat(20)); // safe fallback
    }

    if (numDigits === 3 && config.INT_TD) {
      min = BigInt(100);
      max = BigInt(999);
    } else if (numDigits === 4 && config.INT_FD) {
      min = BigInt(1000);
      max = BigInt(9999);
    } else if (!config.ANYNUM) {
      return originalStr; // skip long numbers if not allowed
    } else {
      min = BigInt("1" + "0".repeat(numDigits - 1));
      max = BigInt("9".repeat(numDigits));
    }

    if (config.NOEXCEED && originalNum < max) {
      max = originalNum;
    }

    if (config.MAXVAL !== null && config.MAXVAL < max) {
      max = config.MAXVAL;
    }

    if (min > max) min = BigInt(0);
    const newNum = generateRandomBigInt(min, max);
    return newNum.toString();
  }

  content = content.replace(/\b\d+\b/g, replacer);

  if (config.INWLNTN) {
    content = content.replace(/([a-zA-Z]+)(\d+)/g, (match, letters, digits) => {
      return letters + replacer(digits);
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
    reader.onload = function (e) {
      finalize(e.target.result, config);
    };
    reader.readAsText(fileInput.files[0]);
    return;
  }

  finalize(content, config);
}

function finalize(content, config) {
  const updated = randomizeNumbers(content, config);
  document.getElementById('output').textContent = updated;

  if (config.CTCB) {
    navigator.clipboard.writeText(updated).then(() => {
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
