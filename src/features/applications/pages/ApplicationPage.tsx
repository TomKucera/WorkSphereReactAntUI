import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Card,
    Typography,
    Select,
    Button,
    Form,
    Input,
    message,
    Spin,
    Flex, Splitter,
    Row, Col 
} from "antd";
import { MailOutlined, PhoneOutlined, FileTextOutlined, FormOutlined, SendOutlined } from "@ant-design/icons";

import { ContactType} from "../../contacts/types/contact";
import { getWorkById } from "../../works/services/workApi";
import { getContacts } from "../../contacts/services/contactApi";
import { getCvs, getCvFileById } from "../../cvs/services/cvApi";

import { getProviderWorkUrl } from '../../../shared/extensions';

import { createApplication } from "../services/applicationApi";


const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const contactIconMap: Record<ContactType, React.ReactNode> = {
    Email: <MailOutlined />,
    Phone: <PhoneOutlined />,
};

export default function ApplicationPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [work, setWork] = useState<any>(null);
    const [cvs, setCvs] = useState<any[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);
    
    const [selectedCvId, setSelectedCvId] = useState<number | null>(null);
    const [cvFileBlobs, setCvFileBlobs] = useState<Record<number, string>>({});

    const [form] = Form.useForm();

    useEffect(() => {
        const loadData = async () => {
            try {
                const workData = await getWorkById(Number(id));
                const contactsData = await getContacts();
                const cvsData = await getCvs();
                setWork(workData);
                setContacts(contactsData);
                setCvs(cvsData);    
            } catch {
                message.error("Failed to load data");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    useEffect(() => {
        console.log("Selected CV ID:", selectedCvId);
        if (!selectedCvId) return;
      
        // skip if blob exists
        if (cvFileBlobs[selectedCvId]) return;
      
        const loadCv = async () => {
          try {
            const blob = await getCvFileById(selectedCvId); // responseType: "blob"
            const blobUrl = URL.createObjectURL(blob);
      
            setCvFileBlobs(prev => ({
              ...prev,
              [selectedCvId]: blobUrl
            }));
          } catch {
            message.error("Failed to load CV file");
          }
        };
      
        loadCv();
      
      }, [selectedCvId, cvFileBlobs]);
      

    const onFinish = async (values: any) => {
        try {
            setSubmitting(true);

            await createApplication({
                workId: Number(id),
                cvId: values.cvId,
                contactEmailId: values.contactEmailId,
                contactPhoneId: values.contactPhoneId,
                message: values.message,
            });

            message.success("Application submitted successfully");
            navigate("/works");
        } catch {
            message.error("Application failed");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Spin size="large" />;

    const selectedCvBlob = selectedCvId ? cvFileBlobs[selectedCvId] : null;

    const buildContactLabel = (type: ContactType) => (
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {contactIconMap[type]}
          {type}
        </span>
    );

    const buildContactSelect = (type: ContactType) => {
        const contactsByType = contacts.filter((c) => c.type === type);
        const options = contactsByType.map((c) => ({label: c.value, value: c.id}));
        const primary = contactsByType.find((c) => c.isPrimary);
        
        let defaultValue: number | null = null;
        
        if (primary) {
            defaultValue = primary.id;
        } else if (contactsByType.length === 1) {
            defaultValue = contactsByType[0].id;
        } else {
            defaultValue = null;
        }

        let disabled: boolean = options.length == 1;

        if (defaultValue != null) {
            const fieldName = type === "Email" ? "contactEmailId" : "contactPhoneId";
            form.setFieldsValue({ [fieldName]: defaultValue });
        }
            
        return (
            <Select
                options={options}
                placeholder={`Choose ${type}`}
                defaultValue={defaultValue} 
                disabled={disabled}
            />
        )
    };

    const buildCvSelect = () => {
        const options = cvs.map((c) => ({label: c.originalFileName, value: c.id}));
        return (
            <Select
                options={options}
                placeholder={`Choose CV`}
                onChange={(value) => setSelectedCvId(value)}
            />
        )
    };

    const elCvLabel = (
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <FileTextOutlined/>
          CV
        </span>
    );

    const elMessageLabel = (
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <FormOutlined/>
          Message
        </span>
    );

    const elWork = (
        <div
            style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* NADPIS */}
            <div style={{ padding: 12 }}>
                <Paragraph>
                    {work.company ?? "?"}
                </Paragraph>
                <Paragraph
                    style={{
                        margin: 0,
                        fontSize: 20,
                        fontWeight: "bold",
                        color: "darkred",
                    }}
                >
                    {
                        work.removedByScanId ? (
                            <>
                                {work.name}
                            </>
                        ) : (
                            <a href={getProviderWorkUrl(work.provider, work.url)} target="_blank" rel="noopener noreferrer" >
                                {work.name}
                            </a>
                        )
                    }
                </Paragraph>
            </div>

            {/* OBSAH */}
            <div style={{ flex: 1, padding: 12, overflow: "hidden" }}>
                <Card
                    size="small"
                    style={{
                        height: "100%",
                        background: "#fafafa",
                        overflow: "hidden",
                    }}
                    styles={{
                        body: {
                            height: "100%",
                            overflow: "auto",
                        },
                    }}
                >
                    <div
                        dangerouslySetInnerHTML={{ __html: work.description }}
                    />
                </Card>
            </div>
        </div>
    )

    const elCv = (

        <div
            style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* NADPIS */}
            {/* <div style={{ padding: 12 }}>
                <Paragraph>
                    {selectedCv.originalFileName}
                </Paragraph>
            </div> */}

            {/* OBSAH */}
            <div style={{ flex: 1, padding: 12, overflow: "hidden" }}>
                <Card
                    size="small"
                    style={{
                        height: "100%",
                        background: "#fafafa",
                        overflow: "hidden",
                    }}
                    styles={{
                        body: {
                          height: "100%",
                          overflow: "auto",
                        },
                      }}
                >
                    {selectedCvBlob ? (
                        <iframe
                        src={selectedCvBlob}
                        width="100%"
                        height="100%"
                        style={{ border: "1px solid #ccc", borderRadius: "6px" }}
                        title="CV Preview"
                    />
                    ):(<></>)
                   }
                </Card>
            </div>
        </div>
    )

    const elApplication = (
        <div style={{ height: "100%", padding: 12 }}>
            <Card size="small" style={{ height: "100%", background: "#fafafa" }}>
                <Form layout="vertical" form={form} onFinish={onFinish}>
                    <Row gutter={16}>
                        <Col span={12}>
                        <Form.Item
                            label={buildContactLabel("Phone")}
                            name="contactPhoneId"
                            rules={[{ required: true, message: "Select Phone" }]}
                        >
                            {buildContactSelect("Phone")}
                        </Form.Item>
                        </Col>
                        <Col span={12}>
                        <Form.Item
                            label={buildContactLabel("Email")}
                            name="contactEmailId"
                            rules={[{ required: true, message: "Select Email" }]}
                        >
                            {buildContactSelect("Email")}
                        </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        label={elCvLabel}
                        name="cvId"
                        rules={[{ required: true, message: "Select CV" }]}
                    >
                        {buildCvSelect()}
                    </Form.Item>

                    <Form.Item label={elMessageLabel} name="message" rules={[{ required: true, message: "Please write message" }]}>
                        <TextArea rows={10} placeholder="Write a message..." />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={<SendOutlined />}
                            loading={submitting}
                        >
                            Submit Application
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    )

    return (
        <>
            <Title level={3}>Apply for job</Title>

            <Flex vertical>

                <Splitter style={{ height: 1000, boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
                    <Splitter.Panel
                        collapsible={{ start: true, end: true, showCollapsibleIcon: "auto" }}
                    //min="20%"
                    >
                        {elWork}  
                    </Splitter.Panel>
                    <Splitter.Panel
                        collapsible={{ start: true, end: true, showCollapsibleIcon: "auto" }}
                    //min="20%"
                    >
                       {elCv}
                    </Splitter.Panel>
                    <Splitter.Panel
                        collapsible={{ start: true, end: true, showCollapsibleIcon: "auto" }}
                        min="30%"
                    >
                   {elApplication}
                    </Splitter.Panel>
                </Splitter>
            </Flex>
        </>
    )
}