(function () {
  "use strict";

  const resultEl = document.getElementById("result");
  const exprEl = document.getElementById("expression");
  const keysEl = document.getElementById("keys");

  // State
  let current = "0"; // current operand being typed
  let previous = null; // previous operand, waiting for operator
  let operator = null; // pending operator
  let justEvaluated = false; // true right after '=' or a computation

  const OP_SYMBOLS = { "+": "+", "-": "−", "×": "×", "÷": "÷" };

  function isOperator(op) {
    return op === "+" || op === "-" || op === "×" || op === "÷";
  }

  function compute(a, op, b) {
    switch (op) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "×":
        return a * b;
      case "÷":
        if (b === 0) return null;
        return a / b;
      default:
        return b;
    }
  }

  function format(n) {
    // current is always a string, but results from compute() are numbers.
    const num = typeof n === "number" ? n : parseFloat(n);
    if (!isFinite(num)) return "Error";
    // Trim trailing zeros / long decimals, cap length.
    let s = parseFloat(num.toPrecision(12)).toString();
    if (s.length > 14) s = num.toPrecision(12);
    return s;
  }

  function render() {
    resultEl.textContent = format(current);
    if (operator && previous !== null) {
      exprEl.textContent = `${format(previous)} ${OP_SYMBOLS[operator]}`;
    } else if (previous !== null && !operator) {
      exprEl.textContent = format(previous);
    } else {
      exprEl.textContent = "";
    }
  }

  function reset() {
    current = "0";
    previous = null;
    operator = null;
    justEvaluated = false;
    render();
  }

  function inputNumber(digit) {
    if (justEvaluated) {
      current = digit === "." ? "0." : digit;
      justEvaluated = false;
      return;
    }
    if (digit === ".") {
      if (!current.includes(".")) current += ".";
      return;
    }
    if (current === "0") {
      current = digit;
    } else if (current.length < 14) {
      current += digit;
    }
  }

  function inputOperator(op) {
    if (justEvaluated && previous === null) {
      // e.g. after '=' then operator
      operator = op;
      previous = parseFloat(current);
      current = "0"; // start fresh for the next operand
      justEvaluated = false;
      return;
    }
    // If we have a pending operator, compute first (chained ops)
    if (operator && previous !== null) {
      const val = compute(parseFloat(previous), operator, parseFloat(current));
      if (val === null) {
        current = "Error";
        previous = null;
        operator = null;
        render();
        return;
      }
      current = format(val);
    }
    previous = parseFloat(current);
    operator = op;
    current = "0"; // start fresh for the next operand
    justEvaluated = false;
  }

  function inputEquals() {
    if (!operator || previous === null) return;
    const val = compute(parseFloat(previous), operator, parseFloat(current));
    if (val === null) {
      current = "Error";
      previous = null;
      operator = null;
      justEvaluated = true;
      render();
      return;
    }
    current = format(val);
    previous = null;
    operator = null;
    justEvaluated = true;
  }

  function inputPercent() {
    const val = parseFloat(current) / 100;
    current = format(val);
  }

  function backspace() {
    if (justEvaluated) {
      current = "0";
      justEvaluated = false;
      return;
    }
    if (current.length > 1) {
      current = current.slice(0, -1);
    } else {
      current = "0";
    }
  }

  // Handle button clicks
  keysEl.addEventListener("click", function (e) {
    const btn = e.target.closest("button");
    if (!btn) return;

    if (btn.dataset.num !== undefined) {
      inputNumber(btn.dataset.num);
    } else if (btn.dataset.op !== undefined) {
      const op = btn.dataset.op;
      if (op === "%") inputPercent();
      else inputOperator(op);
    } else if (btn.dataset.action === "equals") {
      inputEquals();
    } else if (btn.dataset.action === "clear") {
      reset();
    } else if (btn.dataset.action === "backspace") {
      backspace();
    }
    render();
  });

  // Keyboard support
  document.addEventListener("keydown", function (e) {
    const k = e.key;
    let handled = true;

    if (k >= "0" && k <= "9") {
      inputNumber(k);
    } else if (k === ".") {
      inputNumber(".");
    } else if (k === "+" || k === "-") {
      inputOperator(k);
    } else if (k === "*" || k === "/") {
      inputOperator(k === "*" ? "×" : "÷");
    } else if (k === "%" || k === "%") {
      inputPercent();
    } else if (k === "Enter" || k === "=") {
      e.preventDefault();
      inputEquals();
    } else if (k === "Backspace") {
      backspace();
    } else if (k === "Escape") {
      reset();
    } else {
      handled = false;
    }

    if (handled) {
      e.preventDefault();
      render();
    }
  });

  render();
})();