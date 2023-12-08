# pfe-chartsv

> Librairie créée dans l&#x27;optique du rendu PFE de l&#x27;année 5 à l&#x27;IIM

[![NPM](https://img.shields.io/npm/v/pfe-chartsv.svg)](https://www.npmjs.com/package/pfe-chartsv) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## WARNING

If you get an error when executing npm start on /example folder, you have 2 solutions:

<ol>
  <li>
    <p>Upgrade your Node version to latest (actually v20)</p>
  </li>
  <li>
    <p>Remove the <strong>--openssl-legacy-provider</strong> in package.json (line 7-8)</p>
  </li>
</ol>

## Install

```bash
npm install --save pfe-chartsv
```

## Usage

```tsx
import React, { Component } from 'react'

import MyComponent from 'pfe-chartsv'
import 'pfe-chartsv/dist/index.css'

class Example extends Component {
  render() {
    return <MyComponent />
  }
}
```

## License

MIT © [Cocancels](https://github.com/Cocancels)
