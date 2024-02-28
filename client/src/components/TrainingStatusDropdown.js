import React, { useState } from 'react';
import { Select } from 'antd';

const { Option } = Select;

function TrainingStatusDropdown({ initialValue, onChange }) {
  const [value, setValue] = useState(initialValue);

  const handleChange = (newValue) => {
    setValue(newValue);
    onChange(newValue);
  };

  return (
    <Select value={value} onChange={handleChange}>
      <Option value="Attended">Attended</Option>
      <Option value="Not Attended">Not Attended</Option>
    </Select>
  );
}

export default TrainingStatusDropdown;
