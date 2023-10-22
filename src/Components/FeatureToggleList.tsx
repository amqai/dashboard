import React, { useEffect, useState } from 'react';
import { Form, Spin, Switch } from 'antd';

interface FeatureToggleModalProps {
    organizationId: string | null;
    visible: boolean;
}

interface FeatureToggleActionProps {
    organizationId: string | null;
    feature: string;
    enabled: boolean;
    onToggle: () => void; // Prop to handle toggling in the parent component
}
  
const FeatureToggleListItem: React.FC<FeatureToggleActionProps> = ({ organizationId, feature, enabled, onToggle  }) => {
    const handleToggle = async (enable: boolean) => {
        const jwt = localStorage.getItem('jwt');
        try {
            const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/organization/feature?organizationId=${organizationId}`, {
                method: enable ? 'POST' : 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwt}`
                },
                body: JSON.stringify({ organizationFeature: feature })
            });

            if (response.ok) {
                onToggle(); // Call the onToggle prop to refresh the feature state in the parent component
            } else {
                console.error('Failed to toggle feature:', await response.text());
            }
        } catch (error) {
            console.error('Error toggling feature:', error);
        }
    };

    return (
        <Form.Item label={feature}>
            <Switch checked={enabled} onChange={handleToggle} />
        </Form.Item>
    );
};
  
const FeatureToggleList: React.FC<FeatureToggleModalProps> = ({ organizationId, visible }) => {
    const [features, setFeatures] = useState<{ [key: string]: boolean }>({});
    const [loading, setLoading] = useState(false);

    const handleFeatureToggle = () => {
        fetchFeatures(); // Refetch features when a feature is toggled
    };

    const fetchFeatures = async () => {
        if (organizationId) {
          try {
            setLoading(true);
            const jwt = localStorage.getItem('jwt');
            const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/organization/feature?organizationId=${organizationId}`, {
              method: "GET",
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
              }
            });
    
            if (response.ok) {
              const data = await response.json();
              const featuresState: { [key: string]: boolean } = {};
              data.organizationFeatures.forEach((feature: string) => {
                featuresState[feature] = true;
              });
              setFeatures(featuresState);
            } else {
              console.error('Failed to fetch features:', await response.text());
            }
          } catch (error) {
            console.error('Error fetching features:', error);
          } finally {
            setLoading(false);
          }
        }
      };

    useEffect(() => {
        if (visible && organizationId) {
            fetchFeatures();
        }
    }, [visible, organizationId]);

    return (
        <>
            {loading ? (
                <Spin />
            ) : (
                <Form
                    labelCol={{ span: 5 }}
                    style={{ maxWidth: 600 }}
                >
                    <FeatureToggleListItem feature="CHAT" enabled={!!features.CHAT} organizationId={organizationId} onToggle={handleFeatureToggle} />
                    <FeatureToggleListItem feature="WORDPRESS" enabled={!!features.WORDPRESS} organizationId={organizationId} onToggle={handleFeatureToggle} />
                </Form>
            )}
        </>
    );
};

export default FeatureToggleList;
