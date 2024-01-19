import {
  Button,
  Card,
  Form,
  Input,
  Progress,
  Select,
  Slider,
  Space,
  Spin,
  Switch,
} from "antd";
import React, { useEffect, useState } from "react";
import { BiSolidHelpCircle } from "react-icons/bi";
import { Alert as AlertModel, AlertType } from "../models/Alert";
import { GetWordpressSettingsResponse } from "../models/Wordpress";
import { Topic } from "../models/Topic";
import { fetchFeatureToggles, fetchTopics } from "../Services/ApiService";

interface WordpressIntegrationFormProps {
  organizationId: string | undefined;
  setAlertMessage: React.Dispatch<React.SetStateAction<AlertModel | null>>;
}

const WordpressIntegrationForm: React.FC<WordpressIntegrationFormProps> = ({
  organizationId,
  setAlertMessage,
}) => {
  const [loading, setLoading] = useState(false);
  const [wordpressSettings, setWordpressSettings] =
    useState<GetWordpressSettingsResponse | null>(null);
  const [form] = Form.useForm();
  const [apiKey, setApiKey] = useState<string | undefined>("");
  const [currentResponses, setCurrentResponses] = useState<number>(0);
  const [maximumResponses, setMaximumResponses] = useState<number>(1000);
  const [currentMonthPercent, setCurrentMonthPercent] = useState<number>(0);
  const [toggleSettings, setToggleSettings] = useState(false);
  const [topics, setTopics] = useState<Topic[] | null>(null);
  const [configurationExists, setConfigurationExists] = useState(false);
  const [hasWordpressFeatureToggle, setHasWordpressFeatureToggle] =
    useState<boolean>(false);

  const saveWordpressSettings = async (values: {
    enabled: boolean;
    model: string;
    conversationLength: number;
    maximumIpConversations: number;
    terminationResponse: string;
    topicIds: string[];
  }) => {
    if (organizationId) {
      setLoading(true);
      const jwt = localStorage.getItem("jwt");
      const {
        enabled,
        model,
        conversationLength,
        maximumIpConversations,
        terminationResponse,
        topicIds,
      } = values;
      var response;
      if (!configurationExists) {
        response = await fetch(
          `${
            import.meta.env.VITE_APP_API_URL
          }/api/wordpress/settings?organizationId=${organizationId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify({
              model,
              conversationLength,
              maximumIpConversations,
              terminationResponse,
              topicIds,
            }),
          }
        );
        setConfigurationExists(true);
      } else {
        response = await fetch(
          `${
            import.meta.env.VITE_APP_API_URL
          }/api/wordpress/settings?organizationId=${organizationId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify({
              enabled,
              model,
              conversationLength,
              maximumIpConversations,
              terminationResponse,
              topicIds,
            }),
          }
        );
      }
      const content = await response.json();
      if (content.errorCode) {
        setAlertMessage({
          message: content.errorMessage,
          type: AlertType.Error,
        });
      } else {
        refreshWordpressSettings(organizationId);
        setAlertMessage({
          message: "WordPress Integration settings successfully saved.",
          type: AlertType.Success,
        });
      }

      setLoading(false);
    }
  };

  const loadTopics = async (organizationId: string) => {
    const jwt = localStorage.getItem("jwt");
    const content = await fetchTopics(jwt!, organizationId);
    if (content.status === 403 || content.data.errorCode) {
      setAlertMessage({
        message: "There was an error loading your topics",
        type: AlertType.Error,
      });
    } else {
      setTopics(content.data.topics);
      form.setFieldsValue({
        topicIds: topics?.map((topic) => topic.topicId),
      });
    }
  };

  const Loading = () => {
    if (loading) {
      return (
        <Space size="middle">
          {" "}
          <Spin size="large" className="spinner" />{" "}
        </Space>
      );
    }
  };

  const onSwitchChange = (checked: boolean) => {
    form.setFieldsValue({ enabled: checked });
    setToggleSettings(checked);
  };

  const refreshWordpressSettings = async (organizationId: string) => {
    setLoading(true);

    const jwt = localStorage.getItem("jwt");
    const response = await fetch(
      `${
        import.meta.env.VITE_APP_API_URL
      }/api/wordpress/settings?organizationId=${organizationId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    const content = await response.json();
    if (content.errorCode) {
      setConfigurationExists(false);
      setToggleSettings(false);
      setApiKey("Will generate after you save");
      form.setFieldsValue({
        enabled: false,
        model: "gpt-3.5-turbo-1106",
        conversationLength: 3,
        maximumIpConversations: 3,
        terminationResponse:
          "Thank you, please contact our customer service department for more information",
      });
    } else {
      setConfigurationExists(true);
      const settings: GetWordpressSettingsResponse = content;
      setWordpressSettings(settings);
      setToggleSettings(settings.enabled);
      setMaximumResponses(settings.maximumResponses);
      setCurrentResponses(settings.currentMonthResponses);
      if (settings.currentMonthResponses === 0) {
        setCurrentMonthPercent(0);
      } else {
        const percent =
          (settings.currentMonthResponses / settings.maximumResponses) * 100;
        setCurrentMonthPercent(Number(percent.toFixed(2)));
      }
      setApiKey(settings.apiKey);
      form.setFieldsValue({
        enabled: settings.enabled,
        model: settings.model,
        conversationLength: settings.conversationLength,
        maximumIpConversations: settings.maximumIpConversations,
        terminationResponse: settings.terminationResponse,
        topicIds: settings.topicIds,
      });
    }
    setLoading(false);
  };

  const loadFeatureToggles = async (organizationId: string) => {
    setLoading(true);
    loadTopics(organizationId);
    const orgFeatureToggles = await fetchFeatureToggles(organizationId);
    const hasWordpressFeature =
      orgFeatureToggles.organizationFeatures.includes("WORDPRESS");
    setHasWordpressFeatureToggle(hasWordpressFeature);
    if (!hasWordpressFeature) {
      setToggleSettings(false);
      form.setFieldsValue({
        enabled: false,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      if (organizationId) {
        refreshWordpressSettings(organizationId);
        loadFeatureToggles(organizationId);
      }
    })();
  }, [organizationId, form]);

  useEffect(() => {
    if (wordpressSettings) {
      setToggleSettings(wordpressSettings.enabled);
    }
  }, [wordpressSettings, form]);

  return (
    <Card style={{}}
      title={
        <span>
          WordPress Integration{" "}
          <BiSolidHelpCircle title="Settings for your WordPress Chatbot Integration" />
        </span>
      }
    >
      {loading ? (
        <Loading />
      ) : (
        <Form
          className="wordpressSettingsForm"
          onFinish={saveWordpressSettings}
          form={form}
          labelCol={{ span: 6 }}
        >
          {!hasWordpressFeatureToggle && (
            <>
              Please contact your AMQai sales rep for more information on the
              WordPress Integration Plan!
            </>
          )}
          <Form.Item
            label="Enabled"
            name={"enabled"}
            valuePropName="checked"
            style={hasWordpressFeatureToggle != true ? { display: "none" } : {}}
          >
            <Switch
              onChange={onSwitchChange}
              disabled={!hasWordpressFeatureToggle}
            />
          </Form.Item>

          <Form.Item
            label={
              <span>
                API Key{" "}
                <BiSolidHelpCircle title="This is the key that allows you to connect the WordPress plugin, keep this key secret and secure." />
              </span>
            }
            style={toggleSettings != true ? { display: "none" } : {}}
          >
            {apiKey}
          </Form.Item>
          <Form.Item
            label={
              <span>
                Monthly Limit{" "}
                <BiSolidHelpCircle title="The current / total number of monthly responses allowed by your plan." />
              </span>
            }
            style={toggleSettings != true ? { display: "none" } : {}}
          >
            <Progress percent={currentMonthPercent} />
            {currentResponses} / {maximumResponses}
          </Form.Item>
          <Form.Item
            name={"model"}
            label={
              <span>
                Model{" "}
                <BiSolidHelpCircle title="The model that the WordPress plugin will use to generate responses." />
              </span>
            }
            style={toggleSettings != true ? { display: "none" } : {}}
          >
            <Select placeholder="Select Model">
              <Select.Option value="gpt-3.5-turbo-1106">GPT 3.5</Select.Option>
              <Select.Option value="gpt-4">GPT 4</Select.Option>
              <Select.Option value="gpt-4-32k">GPT 4 32k</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name={"topicIds"}
            label={
              <span>
                Topics{" "}
                <BiSolidHelpCircle title="The topics that will power your WordPress plugin." />
              </span>
            }
            style={toggleSettings != true ? { display: "none" } : {}}
          >
            <Select
              mode="multiple"
              placeholder="Select Topics"
              optionLabelProp="label"
            >
              {topics &&
                topics.map((topic: Topic) => (
                  <Select.Option
                    value={topic.topicId}
                    label={topic.topicName}
                    key={topic.topicId}
                  >
                    {topic.topicName}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={
              <span>
                Max Conversation Responses{" "}
                <BiSolidHelpCircle title="The maximum responses a single conversation can make." />
              </span>
            }
            name={"conversationLength"}
            style={toggleSettings != true ? { display: "none" } : {}}
          >
            <Slider min={1} max={10} />
          </Form.Item>
          <Form.Item
            label={
              <span>
                Max Responses by IP{" "}
                <BiSolidHelpCircle title="The maximum number of converations that a specific IP address can initiate." />
              </span>
            }
            name={"maximumIpConversations"}
            style={toggleSettings != true ? { display: "none" } : {}}
          >
            <Slider min={1} max={10} />
          </Form.Item>
          <Form.Item
            label={
              <span>
                Generic Response{" "}
                <BiSolidHelpCircle title="This is a generic response when a limit is reached." />
              </span>
            }
            name={"terminationResponse"}
            rules={[
              {
                message: "Please enter a generic response for your bot",
              },
            ]}
            style={toggleSettings != true ? { display: "none" } : {}}
          >
            <Input.TextArea placeholder="Enter generic response" rows={6} />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            disabled={!hasWordpressFeatureToggle}
            style={hasWordpressFeatureToggle != true ? { display: "none" } : {}}
          >
            <h4>Save</h4>
          </Button>
        </Form>
      )}
    </Card>
  );
};

export default WordpressIntegrationForm;
