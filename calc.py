#!/usr/bin/env python3
"""Simple command-line calculator.

Usage:
    python calc.py "2 + 3 * 4"
    python calc.py "10 / 3"
"""
import sys
import re


def tokenize(expr: str) -> list:
    tokens = re.findall(r"\d+(?:\.\d+)?|[+\-*/%]", expr.replace(" ", ""))
    return tokens


def evaluate(tokens: list) -> float:
    if not tokens:
        raise ValueError("empty expression")

    # First pass: * / %
    result = [tokens[0]]
    i = 1
    while i < len(tokens) - 1:
        op, right = tokens[i], tokens[i + 1]
        if op in ("*", "/", "%"):
            left = float(result.pop())
            r = float(right)
            if op == "*":
                result.append(str(left * r))
            elif op == "/":
                if r == 0:
                    raise ZeroDivisionError("division by zero")
                result.append(str(left / r))
            else:
                result.append(str(left % r))
            i += 2
        else:
            result.append(op)
            result.append(right)
            i += 2

    # Second pass: + -
    total = float(result[0])
    i = 1
    while i < len(result) - 1:
        op, right = result[i], result[i + 1]
        if op == "+":
            total += float(right)
        elif op == "-":
            total -= float(right)
        i += 2

    return total


def main(argv):
    if len(argv) != 2:
        print(__doc__)
        return 1
    try:
        tokens = tokenize(argv[1])
        print(evaluate(tokens))
        return 0
    except (ValueError, ZeroDivisionError) as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))