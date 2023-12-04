import React, { useState, useEffect } from 'react'

interface MultiSelectProps {
  options: string[]
  onChange?: (selectedItems: string[]) => void
}

const MultiSelect: React.FC<MultiSelectProps> = (props) => {
  const { options, onChange } = props
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const handleToggle = (item: string) => {
    setSelectedItems((prevSelectedItems) => {
      const isSelected = prevSelectedItems.includes(item)
      if (isSelected) {
        return prevSelectedItems.filter((selected) => selected !== item)
      } else {
        return [...prevSelectedItems, item]
      }
    })
  }

  useEffect(() => {
    if (onChange) {
      onChange(selectedItems)
    }
  }, [selectedItems, onChange])

  return (
    <div>
      <ul>
        {options.map((item) => (
          <li
            key={item}
            onClick={() => handleToggle(item)}
            style={{
              cursor: 'pointer',
              fontWeight: selectedItems.includes(item) ? 'bold' : 'normal'
            }}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default MultiSelect
