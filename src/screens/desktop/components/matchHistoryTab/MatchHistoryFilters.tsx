import React from 'react';
import { Form, Select, DatePicker, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { getAllCharacterNames, CharacterName } from 'lib/characterIcons';
import '../styles/MatchHistoryFilters.css';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface MatchHistoryFiltersProps {
  onFilterChange: (filters: any) => void;
}

const MatchHistoryFilters: React.FC<MatchHistoryFiltersProps> = ({ onFilterChange }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  
  // Game types and modes matching actual game data
  const gameTypes = ['Ranked', 'Unranked', 'Practice', 'Custom'];
  const gameModes = ['Payload', 'Domination', 'Skirmish', 'Control', 'Escort', 'Assault'];
  
  // Get all character names for the character filter (excluding DUELIST placeholder)
  const characterNames = getAllCharacterNames().filter(name => name !== CharacterName.DUELIST);
  
  // Handle form changes
  const handleFormChange = () => {
    const values = form.getFieldsValue();
    onFilterChange(values);
  };
  
  // Reset all filters
  const handleReset = () => {
    form.resetFields();
    onFilterChange({
      gameType: '',
      gameMode: '',
      dateRange: [null, null],
      hero: '',
    });
  };
  
  return (
    <Form
      form={form}
      layout="vertical"
      onValuesChange={handleFormChange}
      className="match-history-filters"
    >
      <Form.Item 
        name="gameType" 
        label={t('components.desktop.match-history.filters.game-type', 'Game Type')}
      >
        <Select 
          placeholder={t('components.desktop.match-history.filters.select-game-type', 'Select game type')}
          allowClear
        >
          {gameTypes.map(type => (
            <Option key={type} value={type}>{type}</Option>
          ))}
        </Select>
      </Form.Item>
      
      <Form.Item 
        name="gameMode" 
        label={t('components.desktop.match-history.filters.game-mode', 'Game Mode')}
      >
        <Select 
          placeholder={t('components.desktop.match-history.filters.select-game-mode', 'Select game mode')}
          allowClear
        >
          {gameModes.map(mode => (
            <Option key={mode} value={mode}>{mode}</Option>
          ))}
        </Select>
      </Form.Item>
      
      <Form.Item 
        name="dateRange" 
        label={t('components.desktop.match-history.filters.date-range', 'Date Range')}
      >
        <RangePicker 
          style={{ width: '100%' }}
          placeholder={[
            t('components.desktop.match-history.filters.start-date', 'Start date'),
            t('components.desktop.match-history.filters.end-date', 'End date')
          ]}
        />
      </Form.Item>
      
      <Form.Item 
        name="hero" 
        label={t('components.desktop.match-history.filters.hero', 'Hero')}
      >
        <Select 
          placeholder={t('components.desktop.match-history.filters.select-hero', 'Select hero')}
          allowClear
          showSearch
          optionFilterProp="children"
        >
          {characterNames.map(name => (
            <Option key={name} value={name}>{name}</Option>
          ))}
        </Select>
      </Form.Item>
      
      <Form.Item>
        <Button 
          type="default"
          ghost
          onClick={handleReset}
          block
          className="reset-button-outlined has-margin-top-5"
        >
          {t('components.desktop.match-history.filters.reset', 'Reset Filters')}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default MatchHistoryFilters;