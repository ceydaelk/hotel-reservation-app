import React, { useState } from 'react';
import { View, Button, Text, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const DateRangePicker = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleStartChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) setStartDate(selectedDate);
  };

  const handleEndChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) setEndDate(selectedDate);
  };

  return (
    <View style={{ padding: 16 }}>
      <Text>Giriş Tarihi: {startDate ? startDate.toLocaleDateString() : 'Seçilmedi'}</Text>
      <Button title="Giriş Tarihi Seç" onPress={() => setShowStartPicker(true)} />
      {showStartPicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="default"
          onChange={handleStartChange}
        />
      )}

      <View style={{ height: 20 }} />

      <Text>Çıkış Tarihi: {endDate ? endDate.toLocaleDateString() : 'Seçilmedi'}</Text>
      <Button title="Çıkış Tarihi Seç" onPress={() => setShowEndPicker(true)} />
      {showEndPicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display="default"
          onChange={handleEndChange}
        />
      )}
    </View>
  );
};

export default DateRangePicker;

