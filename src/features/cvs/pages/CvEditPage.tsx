import axios from 'axios';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Typography,
  Card,
  Upload,
  message,
  Space,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { createCv } from "../services/cvApi";

const { Title } = Typography;
const { TextArea } = Input;

const MAX_FILE_SIZE_MB = 5;
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const CvUploadPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: any) => {
    if (!fileList.length) {
      message.error("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", fileList[0].originFileObj as File);
    formData.append("name", values.name);
    formData.append("note", values.note || "");

    try {
      setSubmitting(true);
      await createCv(formData);
      message.success("CV uploaded successfully");
      navigate("/cvs");
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const backendMessage = error.response?.data?.detail;
        message.error(backendMessage || "Upload failed");
      } else {
        message.error("Unexpected error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card style={{ maxWidth: 600, margin: "40px auto" }}>
      <Title level={3}>Upload CV</Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Enter short name" }]}
        >
          <Input
          placeholder="Short name"
          maxLength={50}
          />
        </Form.Item>

        <Form.Item
          label="Note"
          name="note"
        >
          <TextArea rows={5} maxLength={300} />
        </Form.Item>

        <Form.Item
          label="File"
          required
        >
          <Upload
            beforeUpload={(file) => {
              const isAllowedType = ALLOWED_TYPES.includes(file.type);
              if (!isAllowedType) {
                message.error("Only PDF, DOC and DOCX files are allowed.");
                return Upload.LIST_IGNORE;
              }

              const isUnderSizeLimit =
                file.size / 1024 / 1024 < MAX_FILE_SIZE_MB;

              if (!isUnderSizeLimit) {
                message.error(`File must be smaller than ${MAX_FILE_SIZE_MB} MB.`);
                return Upload.LIST_IGNORE;
              }

              return false; // prevent auto upload
            }}
            accept=".pdf,.doc,.docx"
            maxCount={1}
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
          >
            <Button icon={<UploadOutlined />}>
              Select File
            </Button>
          </Upload>
        </Form.Item>

        <Form.Item style={{ marginTop: 32 }}>
          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button onClick={() => navigate("/cvs")}>
              Cancel
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
            >
              Upload
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CvUploadPage;