import React from 'react'
import 'pfe-chartsv/dist/index.css'
import { ImportButton, CustomChart } from 'pfe-chartsv'

const App = () => {
  return (
    <div>
      <ImportButton size='medium' />
      <CustomChart
        link='./test.csv'
        chartParams={{
          title: {
            text: 'Test'
          },
          stacked: true,
          showLabels: true,
          yAxisMax: 100,
          yAxisMin: 0,
          height: '500px',
          width: '100%',
          colors: ['#FF0000', '#00FF00'],
          axisColor: 'red',
          legendColor: 'black',
          labelColor: 'white'
        }}
        cols={['age', 'monnaie']}
      />
    </div>
  )
}

export default App
