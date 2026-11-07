# Step 5A.3 — Global Typography Sweep

## Goal

Move text typography across the frontend onto the shared typography tokens instead of letting each feature invent its own pixel values.

This step changes presentation only. It does not change feature behavior, API calls, routing, or business rules.

## Shared scale

Existing semantic roles remain the default:

- page title
- section title
- heading
- body
- body small
- label
- caption
- meta
- overline

The sweep adds a small set of missing roles needed by existing screens:

- display XL — large public/brand display text
- display LG — responsive public/brand display text
- title — prominent content/stat values
- heading LG — modal/card titles that need more emphasis than the base heading
- body LG — emphasized body copy/navigation text

Nearby one-off pixel sizes are normalized into those roles rather than creating a token for every historical pixel value.

## Scope

The sweep covers app layout, address management, auth, home, kitchen menu, marketing, notifications, order summary, POS management, product management, sales, service quality, user management, user registration, and shared components.

Orders typography was already normalized in the previous 5D.3 pass, so remaining numeric font sizes there are intentionally icon sizes.

## Intentional numeric exceptions

Numeric `font-size` values are retained only where `font-size` is sizing an icon/glyph rather than text, for example Ant Design icons, empty-state icons, drag handles, arrows, flags, and icon-only action buttons.

Pixel `line-height` values are retained where they are used as control geometry/vertical centering, for example select items, input-number fields, pagination controls, menu rows, and modal close controls.

## Mapping rule

Historical text sizes are normalized approximately as follows:

```text
9–10px   -> overline
11px     -> meta
12px     -> caption
13px     -> body-sm / label role
14px     -> body
15px     -> body-lg
16px     -> heading
17–18px  -> heading-lg
19–21px  -> section-title
22–26px  -> title
28–30px  -> page-title
40–42px  -> display-lg
48px     -> display-xl
```

This intentionally reduces arbitrary one-off typography sizes while keeping the visual hierarchy close to the previous UI.

## Verification

Audit text-like numeric typography:

```bash
python - <<'PY'
from pathlib import Path
import re

icon_hints = (
    "icon", "anticon", "arrow", "flag", "handle", "thumbnail-empty",
    "more-button", "input-prefix", "upload-empty", "__action.ant-btn",
)

pattern = re.compile(
    r"([^{}]+)\\{([^{}]*?font-size\\s*:\\s*([0-9.]+)px\\s*;[^{}]*?)\\}",
    re.S,
)

for path in Path("src").rglob("*.scss"):
    text = path.read_text(errors="ignore")
    for match in pattern.finditer(text):
        selector = " ".join(match.group(1).split()).lower()
        if not any(hint in selector for hint in icon_hints):
            print(path, match.group(3), selector)
PY
```

Expected result: no text-like numeric font sizes.

Then run the production build and visually regress the main desktop/tablet/mobile flows.
