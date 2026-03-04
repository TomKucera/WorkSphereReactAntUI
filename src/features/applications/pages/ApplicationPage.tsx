import axios from "axios";

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
    Row, Col ,
    Space,
    Tooltip
} from "antd";
import { MailOutlined, PhoneOutlined, FileTextOutlined, FormOutlined, SendOutlined, ThunderboltOutlined } from "@ant-design/icons";

import { ContactType} from "../../contacts/types/contact";
import { getWorkById, getWorkDescription } from "../../works/services/workApi";
import { getContacts } from "../../contacts/services/contactApi";
import { getCvs, getCvFileById } from "../../cvs/services/cvApi";

import { getProviderWorkUrl } from '../../../shared/extensions';

import { generateCoverLetter } from "../../AI/services/aiApi";
import { createApplication } from "../services/applicationApi";


import { Language, LanguageLevel } from "../../AI/types/language";
import { CoverLetterRequest } from "../../AI/types/coverLetterRequest";


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
    const [generating, setGenerating] = useState(false);

    const [work, setWork] = useState<any>(null);
    const [workDescription, setWorkDescription] = useState<string | null>(null);
    const [cvs, setCvs] = useState<any[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);

    const [matchScore, setMatchScore] = useState<number | null>(null);
    
    const [selectedCvId, setSelectedCvId] = useState<number | null>(null);
    const [cvFileBlobs, setCvFileBlobs] = useState<Record<number, string>>({});

    const [form] = Form.useForm();

    useEffect(() => {
        const loadData = async () => {
            const workId = Number(id)

            try {
                const workData = await getWorkById(workId);
                const contactsData = await getContacts();
                const cvsData = await getCvs();
                setWork(workData);
                setContacts(contactsData);
                setCvs(cvsData);

                try {
                    const customDescription = await getWorkDescription(workId);
                    setWorkDescription(customDescription);
                } catch (err: any) {
                    // 404 → no custom description found so far
                    if (err?.response?.status === 404) {
                        setWorkDescription(null);
                    } else {
                        message.error("Failed to load custom description");
                    }
                }
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

    // const handleGenerateMessage = async () => {
    //     if (!selectedCvId) {
    //         message.warning("Please select CV first");
    //         return;
    //     }
    
    //     try {
    //         setGenerating(true);
    
    //         const generatedText = await generateCoverLetter({
    //             work_id: Number(id),
    //             cv_id: selectedCvId,
    //             language: Language.CS,          // or make selectable
    //             // language_level: LanguageLevel.B2,    // or make selectable
    //         });
    
    //         form.setFieldsValue({
    //             message: generatedText,
    //         });
    
    //         message.success("Message generated");
    //     } catch {
    //         message.error("Failed to generate message");
    //     } finally {
    //         setGenerating(false);
    //     }
    // };

    const handleGenerateMessage = async () => {
        if (!selectedCvId) {
            message.warning("Please select CV first");
            return;
        }

        try {
            setGenerating(true);

            const response = await generateCoverLetter({
                work_id: Number(id),
                cv_id: selectedCvId,
                language: Language.CS,
                // language_level: LanguageLevel.C1,
            });

            form.setFieldsValue({
                message: response.body,
            });

            setMatchScore(response.matchScore);

            message.success("Message generated");
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const backendMessage =
                    error.response?.data?.detail ||
                    error.response?.data?.message;
                message.error(backendMessage ?? "Generation failed");
            } else {
                message.error("Unexpected error occurred");
            }
        } finally {
            setGenerating(false);
        }
    };

    if (loading) return <Spin size="large" />;

    const jobDescription = workDescription ?? work.description

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
        // <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        //   <FileTextOutlined/>
        //   CV
        // </span>
        <Flex justify="space-between" align="center">
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <FileTextOutlined />
                CV
            </span>
            <Space>

            {matchScore !== null && (
                            <div style={{ marginBottom: 12 }}>
                                <b>Match score:</b> {(matchScore * 100).toFixed(1)}%
                            </div>
                        )}
            </Space>
        </Flex>
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
                        dangerouslySetInnerHTML={{ __html: jobDescription }}
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

                    {/* <Form.Item label={elMessageLabel} name="message" rules={[{ required: true, message: "Please write message" }]}>
                        <TextArea rows={10} placeholder="Write a message..." />
                    </Form.Item> */}

                    <Form.Item
                        label={
                            
                              <Flex justify="space-between" align="center">
                                <Flex align="center" gap={6}>
                                  {elMessageLabel}
                                </Flex>
                          
                                <Button
                                  type="link"
                                  icon={<ThunderboltOutlined />}
                                  loading={generating}
                                  onClick={handleGenerateMessage}
                                  disabled={!selectedCvId} 
                                >
                                  Generate with AI
                                </Button>
                              </Flex>
                            
                          }
                        name="message"
                        rules={[{ required: true, message: "Please write message" }]}
                        
                    >
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