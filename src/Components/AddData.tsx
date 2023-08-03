import React, { useEffect, useState } from 'react';
import { Button,Collapse,Divider,Form, Select, Typography } from "antd";
import EmbeddingForm from './EmbeddingForm';
import { Topic } from '../models/Topic';

interface AddDataProps {
  organizationId: string;
  topics: Topic[] | null,
  data: string,
}

const AddData: React.FC<AddDataProps> = ({
  organizationId,
  topics,
  data,
}) => {
  const [form] = Form.useForm();
  const [topicId, setTopicId] = useState("");
  const [visible, setVisible] = useState(false);
  const { Panel } = Collapse;

  const handleCancel = () => {
    setVisible(false);
  }

  const addMyData = () => {
    if (topicId !== "") {
      setVisible(true);
    }
  }

  useEffect(() => {
    (
      async () => {
        if (data) {
          form.setFieldsValue({
            identifier: data.substring(0, 50),
            rawData: data
          });
        }
      }
      )();
  }, [data]);

  return (
    <Collapse style={{margin: "16px 0 0 24px"}}>
      <Panel header="Data Options" key={data}>
        <Typography>Add this response to a topic</Typography>
        <Divider />
        <Select
          placeholder="Select Topic"
          optionLabelProp="label"
          onChange={(value) => setTopicId(value)}
        >
          {topics && topics.map((project: Topic) => (
            <Select.Option value={project.projectId} label={project.projectName} key={project.projectId}>
              {project.projectName}
            </Select.Option>
          ))}
        </Select>
      <Button 
          type="primary"
          onClick={addMyData}
          style={{marginLeft: "16px"}}
        >Add</Button>
        <EmbeddingForm
          form={form} 
          visible={visible} 
          editingEmbedding={null} 
          topicId={topicId}
          organizationId={organizationId}
          handleCancel={handleCancel} 
          reloadEmbeddings={() => {}} 
        />
      </Panel>
    </Collapse>
  );
};

export default AddData;
