# pfe-chartsv

> Librairie créée dans l&#x27;optique du rendu PFE de l&#x27;année 5 à l&#x27;IIM

[![NPM](https://img.shields.io/npm/v/pfe-chartsv.svg)](https://www.npmjs.com/package/pfe-chartsv) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Documentation

You can find the documentation [here](https://www.chartsv.fr/).

## Install

```bash
npm install pfe-chartsv
```

## Usage

```tsx
import React from 'react'
import 'pfe-chartsv/dist/index.css'
import { ImportButton, CustomChart } from 'pfe-chartsv'

const App = () => {
  return (
    <div>
      <!-- ImportButton component -->
      <ImportButton size='medium' />

      <!-- CustomChart component -->
      <CustomChart
        link='./test.csv'
        chartParams={{
          stacked: true,
          showLabels: true,
          yAxisMax: 100,
          yAxisMin: 0,
          height: '500px',
          width: '100%',
          colors: ['#FF0000', '#00FF00'],
          textColor: 'red'
        }}
        cols={['age', 'monnaie']}
      />
    </div>
  )
}

export default App
```

<p>You can find the <strong>test.csv</strong> file in 'example/public' folder. </p>

## License

MIT © [Cocancels](https://github.com/Cocancels)
