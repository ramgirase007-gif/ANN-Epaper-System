from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
OUTPUT = BASE_DIR / "09_InDesign" / "Scripts"

def export_jsx():

    print("=" * 60)
    print("EXPORT_JSX() CALLED")
    print("=" * 60)

    OUTPUT.mkdir(parents=True, exist_ok=True)

    jsx = OUTPUT / "ANN_AutoFill.jsx"

    code = '''
alert("ANN Auto Fill Started");
'''

    with open(jsx, "w", encoding="utf-8") as f:
        f.write(code)

    print("JSX Saved :", jsx.resolve())