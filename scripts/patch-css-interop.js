/* global __dirname */
const fs = require('fs');
const path = require('path');

// 1. Patch appearance-observables.js
const appearancePath = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-css-interop',
  'dist',
  'runtime',
  'native',
  'appearance-observables.js'
);

if (fs.existsSync(appearancePath)) {
  let content = fs.readFileSync(appearancePath, 'utf8');
  if (content.includes('if (process.env.NODE_ENV === "test") {')) {
    content = content.replace(
      /if \(process\.env\.NODE_ENV === "test"\) \{\s*colorSchemeObservable\.set\(value === "system" \? "light" : value\);\s*\}/g,
      'colorSchemeObservable.set(value === "system" ? undefined : value);'
    );
    fs.writeFileSync(appearancePath, content, 'utf8');
    console.log('[patch-css-interop] Successfully patched appearance-observables.js');
  }
}

// 2. Patch api.js (prevents React state update on unmounted component)
const apiPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-css-interop',
  'dist',
  'runtime',
  'native',
  'api.js'
);

if (fs.existsSync(apiPath)) {
  let content = fs.readFileSync(apiPath, 'utf8');
  if (!content.includes('isMounted')) {
    content = content.replace(
      /function useColorScheme\(\) \{\s*const \[effect, setEffect\] = \(0, react_1\.useState\)\(\(\) => \(\{\s*run: \(\) => setEffect\(\(s\) => \(\{ \.\.\.s \}\)\),\s*dependencies: new Set\(\),\s*\}\)\);/g,
      `function useColorScheme() {
    const isMounted = (0, react_1.useRef)(false);
    (0, react_1.useEffect)(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);
    const [effect, setEffect] = (0, react_1.useState)(() => ({
        run: () => {
            if (isMounted.current) {
                setEffect((s) => ({ ...s }));
            }
        },
        dependencies: new Set(),
    }));`
    );
    fs.writeFileSync(apiPath, content, 'utf8');
    console.log(
      '[patch-css-interop] Successfully patched api.js useColorScheme with isMounted guard'
    );
  }
}

// 3. Patch render-component.js (prevents crash when stringify touches throwing getters like LinkingContext)
const renderComponentPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-css-interop',
  'dist',
  'runtime',
  'native',
  'render-component.js'
);

if (fs.existsSync(renderComponentPath)) {
  let content = fs.readFileSync(renderComponentPath, 'utf8');
  if (
    content.includes('for (const entry of Object.entries(value)) {') &&
    !content.includes('[Unserializable]')
  ) {
    content = content.replace(
      /const newValue = Array\.isArray\(value\) \? \[\] : \{\};\s*for \(const entry of Object\.entries\(value\)\) \{\s*newValue\[entry\[0\]\] = replace\(entry\[0\], entry\[1\]\);\s*\}/g,
      `const newValue = Array.isArray(value) ? [] : {};
        try {
            for (const entry of Object.entries(value)) {
                try {
                    newValue[entry[0]] = replace(entry[0], entry[1]);
                } catch {
                    newValue[entry[0]] = "[Unserializable]";
                }
            }
        } catch {
            return "[Unserializable]";
        }`
    );
    fs.writeFileSync(renderComponentPath, content, 'utf8');
    console.log(
      '[patch-css-interop] Successfully patched render-component.js with safe stringify'
    );
  }
}
