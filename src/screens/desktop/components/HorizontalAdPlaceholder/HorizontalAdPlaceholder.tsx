import { Card, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import './HorizontalAdPlaceholder.css';

const { Text } = Typography;

interface HorizontalAdPlaceholderProps {
  height?: number;
}

/**
 * HorizontalAdPlaceholder - A horizontal advertisement placeholder 
 * that spans the full width at the bottom of the desktop screen
 */
const HorizontalAdPlaceholder: React.FC<HorizontalAdPlaceholderProps> = ({ 
  height = 100 
}) => {
  const { t } = useTranslation();

  return (
    <div className="horizontal-ad-placeholder" style={{ minHeight: height }}>
      <Card className="ad-placeholder" bordered={false}>
        <Text type="secondary" className="text-center block">
          {t('components.desktop.ad-space', 'Ad Space')}
        </Text>
      </Card>
    </div>
  );
};

export default HorizontalAdPlaceholder;