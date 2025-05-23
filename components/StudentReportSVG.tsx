import React from "react";

export const StudentReportHTML = React.forwardRef<HTMLDivElement, { data: any }>(
    ({ data }, ref) => (
        <div ref={ref} style={{
            background: "#fff",
            width: 800,
            margin: "0 auto",
            fontFamily: "Anuphan, sans-serif",
            color: "#222",
            padding: 0,
            boxShadow: "0 2px 8px #0001",
            position: "relative",
            overflow: "hidden"
        }}>
            {/* Google Fonts for Anuphan */}
            <link href="https://fonts.googleapis.com/css2?family=Anuphan:wght@400;700&display=swap" rel="stylesheet" />
            {/* Book spine bar */}
            <div style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: 50,
                height: "100%",
                background: "#454365",
                zIndex: 1,
                marginTop: 102,
                overflow: "hidden"
            }} />
            {/* Main content with left margin */}
            <div style={{
                marginLeft: 50,
                padding: 32,
                position: "relative",
                zIndex: 2
            }}>
                {/* PDF Header */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 24,
                    background: "#fff",
                    borderTopRightRadius: 16,
                    borderTopLeftRadius: 0,
                    borderBottomRightRadius: 0,
                    borderBottomLeftRadius: 0,
                    padding: "0 0 0 0"
                }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: "#7B67A8", marginLeft: 8 }}>
                        {data.schoolName}
                    </div>
                    <div style={{
                        width: 48,
                        height: 48,
                        background: "#383767",
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 8
                    }}>
                        <img src="/favicon.ico" alt="logo" style={{ width: 36, height: 36 }} />
                    </div>
                </div>
                {/* Report Header Section - new layout */}
                <div style={{ display: "flex", background: "#9291DE", padding: 32, alignItems: "center", marginBottom: 24 }}>
                    {/* Left: Student Report/date box */}
                    <div>
                        <div style={{ fontSize: 60, fontWeight: 700, color: "#fff", fontFamily: "Anuphan, sans-serif", lineHeight: 1 }}>Student</div>
                        <div style={{ fontSize: 38, fontWeight: 700, color: "#222", fontFamily: "Anuphan, sans-serif", lineHeight: 1, marginTop: -8 }}>
                            Report <span style={{ fontSize: 22, fontWeight: 400, color: "#fff", marginLeft: 12 }}>{data.date || "9/03/2568"}</span>
                        </div>
                    </div>
                    {/* Right: Student info and profile image */}
                    <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "flex-end" }}>
                        <div style={{ textAlign: "right", marginRight: 32 }}>
                            <div style={{ fontSize: 20, fontWeight: 700, color: "#222", fontFamily: "Anuphan, sans-serif" }}>
                                {data.studentInfo.name}
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#454365", marginTop: 8, fontFamily: "Anuphan, sans-serif" }}>
                                <span style={{ color: "#fff", fontWeight: 900 }}>ชั้น</span> <span style={{ color: "#fff" }}>{data.studentInfo.class}</span>
                                <span style={{ marginLeft: 24, color: "#fff", fontWeight: 900 }}>ปีการศึกษา</span> <span style={{ color: "#fff" }}>{data.courseInfo.educationYear}</span>
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginTop: 8, fontFamily: "Anuphan, sans-serif" }}>
                                <span style={{ color: "#fff" }}>รายวิชา</span> <span style={{ fontWeight: 400 }}>{data.courseInfo.subject}</span>
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginTop: 8, fontFamily: "Anuphan, sans-serif" }}>
                                <span style={{ color: "#fff" }}>คำอธิบาย</span> <span style={{ fontWeight: 400 }}>{data.courseInfo.description}</span>
                            </div>
                        </div>
                        <div style={{
                            width: 120,
                            height: 120,
                            borderRadius: "50%",
                            border: "8px solid #7B67A8",
                            overflow: "hidden",
                            background: "#bcb8f8"
                        }}>
                            <img src={data.studentInfo.imageURL} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                    </div>
                </div>
                {/* ครูประจำชั้น/ครูผู้สอน */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "#fff",
                    borderTop: "4px solid #9291DE",
                    padding: "32px 40px 24px 40px",
                    marginBottom: 24,
                    borderRadius: 0,
                }}>
                    {/* ครูประจำชั้น */}
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 16, color: "#222", fontFamily: "Anuphan, sans-serif" }}>
                            ครูประจำชั้น
                        </div>
                        {data.teachers.homeroom.map((name: string, idx: number) => (
                            <div key={idx} style={{ fontWeight: 400, fontSize: 16, color: "#222", fontFamily: "Anuphan, sans-serif" }}>
                                {name}
                            </div>
                        ))}
                    </div>
                    {/* ครูผู้สอน */}
                    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                        <div
                            style={{
                                width: 90,
                                height: 90,
                                borderRadius: "50%",
                                border: "5px solid #9291DE",
                                overflow: "hidden",
                                background: "#fff",
                            }}
                        >
                            <img
                                src={data.teachers.instructor.imageURL}
                                alt="instructor"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 16, color: "#222", fontFamily: "Anuphan, sans-serif" }}>
                                ครูผู้สอน
                            </div>
                            <div style={{ fontWeight: 400, fontSize: 16, color: "#222", fontFamily: "Anuphan, sans-serif" }}>
                                {data.teachers.instructor.name}
                            </div>
                            <div style={{ fontWeight: 400, fontSize: 16, color: "#222", fontFamily: "Anuphan, sans-serif" }}>
                                E-mail: {data.teachers.instructor.email}
                            </div>
                        </div>
                    </div>
                </div>
                {/* สรุปเวลาเรียน */}
                <div style={{
                    background: "#e6e6fa",
                    borderRadius: 8,
                    padding: "12px 24px",
                    marginBottom: 16,
                    display: "flex",
                    justifyContent: "space-between"
                }}>
                    <div><b>สรุปเวลาเรียน :</b> {data.attendance.status}</div>
                    <div>เวลาเรียน: {data.attendance.totalHours} ชม.</div>
                </div>
                <div style={{ display: "flex", gap: 32, marginBottom: 16, justifyContent: "space-between", paddingInline: 16 }}>
                    {data.attendance.summary.map((s: any, i: number) => (
                        <div key={i}>
                            {s.status === "attended" && "มาเรียน"}
                            {s.status === "absent" && "ขาด"}
                            {s.status === "leave" && "ลา"}
                            {s.status === "late" && "มาสาย"}
                            : {s.value}%
                        </div>
                    ))}
                </div>
                {/* สรุปผลการเรียน */}
                <div style={{
                    background: "#e6e6fa",
                    borderRadius: 8,
                    padding: "12px 24px",
                    marginBottom: 0,
                    display: "flex",
                    justifyContent: "space-between"
                }}>
                    <div><b>สรุปผลการเรียน : เกรด {data.academicPerformance.overallGrade.toFixed(2)}</b></div>
                    <div>{data.academicPerformance.overallScore}/{data.academicPerformance.maxScore}</div>
                </div>
                {/* ตารางคะแนน */}
                <table style={{ width: "100%", margin: "12px 0 24px 0", borderCollapse: "collapse", fontSize: 15 }}>
                    <thead>
                        <tr style={{ background: "#f5f6fa" }}>
                            <th style={{ textAlign: "left", padding: "8px 12px" }}>รายการ</th>
                            <th style={{ textAlign: "right", padding: "8px 12px" }}>คะแนน</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.academicPerformance.assessments.map((a: any, i: number) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f5f6fa" }}>
                                <td style={{ padding: "8px 12px" }}>{i + 1}. {a.item}</td>
                                <td style={{ padding: "8px 12px", textAlign: "right" }}>{a.score}/{a.maxScore}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* ทักษะ: Pie Chart + Skill Table side by side */}
                <div style={{ display: "flex", gap: 32, alignItems: "flex-start", marginBottom: 24 }}>
                    {/* Pie Chart */}
                    <div style={{ flex: 1, minWidth: 0, display: "flex", justifyContent: "center" }}>
                        <div style={{ width: 350, height: 350, borderRadius: 16 }}>
                            <svg width={350} height={350} style={{ overflow: "visible" }}>
                                {(() => {
                                    const skills = data.skillAssessment.skills;
                                    const total = skills.reduce((sum: any, s: any) => sum + s.percentage, 0);
                                    let startAngle = 0;
                                    const cx = 160, cy = 160, rOuter = 60, rInner = 25;
                                    const pieColors = [
                                        "#bcb8f8", "#7B67A8", "#454365", "#222", "#3A86FF", "#40C9A2", "#FFB830"
                                    ];
                                    return skills.map((s: any, i: number) => {
                                        const angle = (s.percentage / total) * 360;
                                        const endAngle = startAngle + angle;
                                        const largeArc = angle > 180 ? 1 : 0;
                                        const rad = (d: number) => (Math.PI / 180) * d;
                                        const x1 = cx + rOuter * Math.cos(rad(startAngle - 90));
                                        const y1 = cy + rOuter * Math.sin(rad(startAngle - 90));
                                        const x2 = cx + rOuter * Math.cos(rad(endAngle - 90));
                                        const y2 = cy + rOuter * Math.sin(rad(endAngle - 90));
                                        const x3 = cx + rInner * Math.cos(rad(endAngle - 90));
                                        const y3 = cy + rInner * Math.sin(rad(endAngle - 90));
                                        const x4 = cx + rInner * Math.cos(rad(startAngle - 90));
                                        const y4 = cy + rInner * Math.sin(rad(startAngle - 90));
                                        const pathData = [
                                            `M ${x1} ${y1}`,
                                            `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2}`,
                                            `L ${x3} ${y3}`,
                                            `A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4} ${y4}`,
                                            "Z"
                                        ].join(" ");
                                        const midAngle = startAngle + angle / 2;
                                        const labelR = rOuter + 24;
                                        const lx = cx + labelR * Math.cos(rad(midAngle - 90));
                                        const ly = cy + labelR * Math.sin(rad(midAngle - 90));
                                        const label = `${s.skill} ${s.percentage}%`;
                                        startAngle += angle;
                                        return (
                                            <g key={i}>
                                                <path d={pathData} fill={pieColors[i % pieColors.length]} />
                                                <text
                                                    x={lx}
                                                    y={ly}
                                                    fontSize={16}
                                                    fontFamily="Anuphan, sans-serif"
                                                    fill="#222"
                                                    textAnchor={lx > cx ? "start" : "end"}
                                                    alignmentBaseline="middle"
                                                    style={{ fontWeight: 500 }}
                                                >
                                                    {label}
                                                </text>
                                            </g>
                                        );
                                    });
                                })()}
                            </svg>
                        </div>
                    </div>
                    {/* Skill Table */}
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: "bold", marginBottom: 8 }}>{data.skillAssessment.title}</div>
                        <table style={{ borderCollapse: "collapse", fontSize: 15, width: "100%" }}>
                            <thead>
                                <tr style={{ background: "#f5f6fa" }}>
                                    <th style={{ textAlign: "left", padding: "6px 12px" }}>ทักษะ</th>
                                    <th style={{ textAlign: "right", padding: "6px 12px" }}>percent</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.skillAssessment.skills.map((s: any, i: number) => (
                                    <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f5f6fa" }}>
                                        <td style={{ padding: "6px 12px" }}>{i + 1}. {s.skill}</td>
                                        <td style={{ padding: "6px 12px", textAlign: "right" }}>{s.percentage}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* ข้อเสนอแนะ */}
                <div
                    style={{
                        background: "#e6e6fa",
                        borderRadius: 8,
                        padding: "20px 32px",
                        marginBottom: 32,
                        fontFamily: "Anuphan, sans-serif",
                        fontSize: 18,
                        display: "flex",
                        gap: 32,
                        alignItems: "flex-start",
                    }}
                >
                    {/* ซ้าย: เส้นกรอก 6 บรรทัด (พื้นหลังขาว) */}
                    <div style={{ flex: 1, background: "#fff", borderRadius: 6, padding: "16px 20px", minHeight: 180, boxShadow: "0 1px 4px #bcb8f822", border: "1.5px solid #bcb8f8" }}>
                        <b style={{ display: "block", marginBottom: 12 }}>ข้อเสนอแนะ:</b>
                        <div>
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    style={{
                                        borderBottom: "1.5px dashed #bcb8f8",
                                        minHeight: 28,
                                        marginBottom: 8,
                                        background: "transparent",
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    {/* ขวา: ข้อเสนอแนะจากระบบ */}
                    <div
                        style={{
                            flex: 1,
                            background: "#fff",
                            borderRadius: 6,
                            padding: "16px 20px",
                            fontSize: 16,
                            color: "#222",
                            minHeight: 180,
                            boxShadow: "0 1px 4px #bcb8f822",
                            border: "1.5px solid #bcb8f8",
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        {data.recommendations}
                    </div>
                </div>
                {/* ลายเซ็น */}
                <div style={{ textAlign: "right", marginTop: 48 }}>
                    <div>......................................................</div>
                    <div>{data.signatureFields.position}</div>
                    <div>{data.signatureFields.name}</div>
                </div>
            </div>
        </div>
    )
);
StudentReportHTML.displayName = "StudentReportHTML";