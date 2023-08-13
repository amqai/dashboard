import { Button, Modal, Space, Spin, Table, Upload } from 'antd';
import React, { useEffect, useState } from 'react';
import { DeleteOutlined, UploadOutlined, CheckOutlined } from "@ant-design/icons";

interface PdfTableProps {
    organizationId: string;
    topicId: string;
}

interface PdfJob {
    jobId: string,
    fileName: string,
    status: string,
    totalPages: number,
    totalTokens: number,
    estimatedPrice: number,
    totalCost: number,
    totalRealCost: number,
}

const PdfTable: React.FC<PdfTableProps> = ({
    organizationId,
    topicId,
  }) => {

    const DEFAULT_LOADING_MESSAGE = "Uploading file, please wait"
    const [tableData, setTableData] = useState<PdfJob[]>();
    const [file, setFile] = useState<File | null>(null);
    const [visible, setVisible] = useState(false);
    const [activeFile, setActiveFile] = useState<PdfJob | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(DEFAULT_LOADING_MESSAGE);

    const columns = [
        {
          key: "1",
          title: "File Name",
          dataIndex: "fileName",
        },
        {
          key: "2",
          title: "Status",
          render: (pdfJob: PdfJob) => {
            return (
              <>
                {pdfJob.status === "ACTIVE_EMBEDDING" && (
                  <Spin>Loading</Spin>
                )}
                {pdfJob.status === "FINISH_EMBEDDING" && (
                  <><CheckOutlined /> Uploaded</>
                )}
              </>
            )
          }
        },
        {
          key: "3",
          title: "Pages",
          dataIndex: "totalPages",
        },
        {
          key: "4",
          title: "Actions",
          render: () => {
            return (
              <>
                <DeleteOutlined
                  onClick={() => {
                    console.log("Not implemented yet")
                  }}
                  style={{ color: "red", marginLeft: 12 }}
                />
              </>
            );
          },
        },
    ];

    const loadTableData = async() => {
        const jwt = localStorage.getItem('jwt');
        const url = `${import.meta.env.VITE_APP_API_URL}/api/projects/pdf?organizationId=${organizationId}&projectId=${topicId}`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
        });

        if (response.ok) {
            const content = await response.json();
            setTableData(content.jobs)
        } else {
            // handle error
        }
    };

    const uploadFile = async () => {
      if (!file) {
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
  
      try {
        const jwt = localStorage.getItem('jwt');
        const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/projects/pdf?organizationId=${organizationId}&projectId=${topicId}`, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${jwt}`
          }
        });
  
        if (response.ok) {
          const content = await response.json();
          setActiveFile(content);
          setLoadingMessage(DEFAULT_LOADING_MESSAGE);
          setLoading(true);
          setVisible(true);
          pollStatus(content.jobId);
        } else {
          console.error('Error uploading file:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    const pollStatus = async (pdfId: string) => {
      const jwt = localStorage.getItem('jwt');
      
      let status = "ACTIVE_INGESTING";
      let finishedJobResponse = null;

      while (status === "ACTIVE_INGESTING") {
        const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/projects/pdf/${pdfId}?organizationId=${organizationId}&projectId=${topicId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${jwt}`
          }
        });
        const content: PdfJob = await response.json();
        status = content.status;
        if (status === "FINISH_INGESTING") {
          finishedJobResponse = content;
          setLoading(false);
        } else if (content.status === "ERROR") {
          console.error("Error finalizing file");
          return;
        }

        if (status === "ACTIVE_INGESTING") {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      setActiveFile(finishedJobResponse);
    }

    const handleFileChange = (file: any) => {
      setFile(file);
      return false;
    };

    const handleCancel = () => {
      setFile(null);
      setVisible(false);
    }

    const handleIngesting = async () => {
      const jwt = localStorage.getItem('jwt');
      setLoadingMessage("File is being processed, please wait")
      setLoading(true);
      await fetch(`${import.meta.env.VITE_APP_API_URL}/api/projects/pdf/${activeFile?.jobId}/embed?organizationId=${organizationId}&projectId=${topicId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          }
      });
      setFile(null);
      setLoading(false);
      setVisible(false);
      await new Promise(resolve => setTimeout(resolve, 1000));
      loadTableData();
    }

    const Loading = () => {
      if(loading) {
        return <Space size="middle">{loadingMessage} <br /><Spin size="large" className="spinner" /> </Space>
      }
    }

    useEffect(() => {
      (
        async () => {
          loadTableData()
        }
      )();
    }, [organizationId, topicId]);

    return (
        <>
            <div className="settings-form-buttons" style={{borderTop: 0}}>
              <Upload
                beforeUpload={handleFileChange}
                accept=".pdf,.json"
                maxCount={1}
              >
                  <Button icon={<UploadOutlined />}>Select File</Button>
              </Upload>
            </div>
            <div  className="settings-form-buttons" style={{borderTop: 0}}>
              <Button type="primary" onClick={uploadFile}>Upload</Button>
            </div>
            <div className="settings-form-field-100">
                <Table dataSource={tableData} columns={columns}/>
            </div>
            <Modal
              title={"Upload file"}
              open={visible}
              onCancel={handleCancel}
              onOk={handleIngesting}
              okButtonProps={{ disabled: loading }}
            >
              {loading ? (
                <Loading />
              ) : (
                <>Estimated price: ${activeFile?.estimatedPrice}</>
              )}
            </Modal>
        </>
    );
  };
  
export default PdfTable;