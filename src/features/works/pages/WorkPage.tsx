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
    Row, Col,
    Space,
    Tooltip,
    Avatar
} from "antd";
import { MailOutlined, PhoneOutlined, FileTextOutlined, FormOutlined, SendOutlined, ThunderboltOutlined } from "@ant-design/icons";

import type { Work } from "../types/work";
import { getWorkById, getWorkDescription, setWorkDescription } from "../../works/services/workApi";
import { getApplicationByWorkId } from "../../applications/services/applicationApi";

import { getProviderWorkUrl, getProviderIcon } from '../../../shared/extensions';
import { Header, Footer } from "antd/es/layout/layout";

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;


export default function WorkPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [generating, setGenerating] = useState(false);

    const [work, setWork] = useState<Work | null>(null);
    const [workApplication, setWorkApplication] = useState<any>(null);

    const [lastCutomDescription, setLastCutomDescription] = useState<string | null>(null);
    const [nextCutomDescription, setNextCutomDescription] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            const workId = Number(id)

            setLoading(true);
            try {
                const workData = await getWorkById(workId);
                setWork(workData);

                try {
                    const customDescription = await getWorkDescription(workId);
                    setLastCutomDescription(customDescription);
                    setNextCutomDescription(customDescription);

                } catch (err: any) {
                    // 404 → no custom description found so far
                    if (err?.response?.status === 404) {
                        setLastCutomDescription(null);
                        setNextCutomDescription(null);
                    } else {
                        message.error("Failed to load custom description");
                    }
                }

                try {
                    const application = await getApplicationByWorkId(workId);
                    setWorkApplication(application);
                } catch (err: any) {
                    // 404 → no custom description found so far
                    if (err?.response?.status === 404) {
                        setWorkApplication(null);
                    } else {
                        message.error("Failed to load work application");
                    }
                }
            } catch {
                message.error("Failed to load work data");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);



    const onFinish = async () => {
        try {
            setSubmitting(true);

            const workId = Number(id)
            await setWorkDescription(workId, nextCutomDescription!);

            message.success("Custom description updated successfully.");
            navigate("/works");
        } catch {
            message.error("Description update failed.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Spin size="large" />;
    if (!work) return <Spin size="large" />;

    const readonly = work.removedByScanId || workApplication;
    const company = work.company?.trim();

    const elHeader = (
        <Header
            style={{
                backgroundColor: "white",
                padding: "12px",
                height: "auto",
                lineHeight: "normal",
            }}
        >
            <Row align="middle" justify="space-between" wrap={false}>
                <Col flex={1}>
                    <Avatar
                        src={getProviderIcon(work.provider)}
                        size={18}
                        shape="square"
                    />
                    <Text type="secondary" style={{ fontSize: 16, padding: 12 }}>
                        {work.provider}
                    </Text>
                </Col>
                <Col flex={1}>
                    <Text
                        strong={!!company}
                        type={company ? undefined : "secondary"}
                        style={{ fontSize: 16, color: company ? undefined : "#999" }}
                    >
                        {company || "Company ???"}
                    </Text>
                </Col>
                <Col flex={3}>
                    <Text
                        style={{
                            fontSize: 20,
                            fontWeight: 700,
                            color: "darkred",
                        }}
                    >
                        {work?.removedByScanId ? (
                            work?.name
                        ) : (
                            <a
                                href={getProviderWorkUrl(work.provider, work.url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: "inherit" }}
                            >
                                {work?.name}
                            </a>
                        )}
                    </Text>
                </Col>
            </Row>
        </Header>
    )

    const elDescriptionOriginal = (
        <div style={{ height: "100%", padding: 12 }}>
            <Card
                size="small"
                title={<Text strong>Original Description</Text>}
                style={{ height: "100%", background: "#fafafa" }}
                styles={{
                    body: {
                        height: "100%",
                        overflow: "auto",
                    },
                }}
            >
                <div style={{ height: "95%", overflow: "scroll" }} dangerouslySetInnerHTML={{ __html: work.description ?? "" }} />
            </Card>
        </div>
    );


    const elDescriptionCustom = (
        <div style={{ height: "100%", padding: 12 }}>
            <Card
                size="small"
                title={<Text strong>Custom Description</Text>}
                style={{ height: "100%", background: "#fafafa" }}
                styles={{
                    body: {
                        height: "100%",
                        //display: "flex",
                        overflow: "auto",
                        //flexDirection: "column",
                    },
                }}
            >
                <TextArea
                    value={nextCutomDescription ?? ""}
                    onChange={(e) => setNextCutomDescription(e.target.value)}
                    placeholder="Write custom description..."
                    style={{
                        resize: "none",
                        height: "95%",
                    }}
                    disabled={readonly}
                />
            </Card>
        </div>
    );


    return (
        <>
            <Title level={3}>Work</Title>

            <Header style={{ backgroundColor: "white" }}>
                {elHeader}
            </Header>

            <Flex vertical gap={16}>
                <Splitter style={{ height: 1000, boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
                    <Splitter.Panel
                        collapsible={{ start: true, end: true, showCollapsibleIcon: "auto" }}
                        min="30%"
                        style={{ minHeight: 0 }}
                    >
                        {elDescriptionOriginal}
                    </Splitter.Panel>
                    <Splitter.Panel
                        collapsible={{ start: true, end: true, showCollapsibleIcon: "auto" }}
                        min="30%"
                    >
                        {elDescriptionCustom}
                    </Splitter.Panel>
                </Splitter>
                <Flex justify="end" gap={12}>
                    <Button
                        onClick={() => navigate("/works")}
                        style={{ width: 100 }}
                    >
                        {readonly ? 'Close' : 'Cancel'}
                    </Button>
                    {!readonly && (
                        <Button
                            type="primary"
                            loading={submitting}
                            onClick={onFinish}
                            disabled={(lastCutomDescription ?? "") === (nextCutomDescription ?? "")}
                            style={{ width: 100 }}
                        >
                            Save
                        </Button>
                    )}

                </Flex>
            </Flex>
        </>
    )
}
