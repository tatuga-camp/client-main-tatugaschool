import React from "react";
import { ResponseGetStudentOnSubjectReportService } from "../services";

const colors = {
  primary: "#2C7CD1",
  primaryHover: "#2d6fb5",
  primaryFocus: "#275d96",
  secondary: "#569DF8",
  background: "#F7F8FA",
  icon: "#383767",
  info: "#2E90FA",
  success: "#27AE60",
  warning: "#FFCD1B",
  error: "#F04438",
  text: "#383767",
  white: "#FFFFFF",
  gray: "#E0E0E0",
  lightGray: "#F5F5F5",
};

export const StudentReportHTML = React.forwardRef<
  HTMLDivElement,
  { data: ResponseGetStudentOnSubjectReportService }
>(({ data }, ref) => (
  <div
    ref={ref}
    style={{
      background: "#fff",
      width: 800,
      margin: "0 auto",
      fontFamily: "'Anuphan', sans-serif",
      color: colors.text,
      padding: 0,
      position: "relative",
      boxSizing: "border-box",
      overflow: "hidden",
    }}
  >
    {/* Fonts */}
    <link
      href="https://fonts.googleapis.com/css2?family=Anuphan:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />

    {/* Header */}
    <div
      style={{
        padding: "24px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: `2px solid ${colors.background}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <img
          src="/favicon.ico"
          alt="logo"
          style={{
            width: 28,
            height: 28,
          }}
        />
        <div style={{ fontSize: 22, fontWeight: 700, color: colors.primary }}>
          {data.schoolName}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div
          style={{
            fontSize: 12,
            color: colors.icon,
            opacity: 0.7,
            fontWeight: 500,
            textTransform: "uppercase",
            marginBottom: 2,
          }}
        >
          Issue Date
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>
          {new Date().toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>
    </div>

    {/* Hero / Student Info */}
    <div
      style={{
        margin: "24px 40px",
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
        borderRadius: 20,
        padding: "24px 32px",
        color: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: `0 10px 20px ${colors.primary}26`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative Circle */}
      <div
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 150,
          height: 150,
          background: "rgba(255,255,255,0.1)",
          borderRadius: "50%",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, flex: 1 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            opacity: 0.9,
            marginBottom: 4,
            letterSpacing: "0.5px",
          }}
        >
          STUDENT REPORT CARD
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            marginBottom: 20,
            lineHeight: 1.2,
          }}
        >
          {data.courseInfo.educationYear}
        </div>

        <div style={{ display: "flex", gap: 40 }}>
          <div>
            <div
              style={{ fontSize: 11, opacity: 0.8, textTransform: "uppercase" }}
            >
              Student Name
            </div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              {data.studentInfo.name}
            </div>
          </div>
          <div>
            <div
              style={{ fontSize: 11, opacity: 0.8, textTransform: "uppercase" }}
            >
              Class
            </div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              {data.studentInfo.class}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <div
            style={{ fontSize: 11, opacity: 0.8, textTransform: "uppercase" }}
          >
            Subject
          </div>
          <div style={{ fontSize: 16, fontWeight: 500 }}>
            {data.courseInfo.subject}
            {data.courseInfo.description && (
              <span style={{ fontSize: 14, opacity: 0.9, fontWeight: 400 }}>
                {" "}
                - {data.courseInfo.description}
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: "50%",
          border: "4px solid rgba(255,255,255,0.3)",
          overflow: "hidden",
          background: "#fff",
          position: "relative",
          zIndex: 1,
          flexShrink: 0,
        }}
      >
        <img
          src={data.studentInfo.imageURL}
          alt="student"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    </div>

    {/* Main Content Grid */}
    <div style={{ padding: "0 40px", display: "flex", gap: 32 }}>
      {/* Left Column */}
      <div style={{ flex: 1 }}>
        {/* Instructors */}
        <div style={{ marginBottom: 24 }}>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: colors.primary,
              marginBottom: 12,
              borderBottom: `1px solid ${colors.gray}`,
              paddingBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: colors.secondary,
              }}
            ></span>
            Instructors
          </h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              paddingLeft: 8,
            }}
          >
            {data.teachers.homeroom && (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: colors.background,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    color: colors.icon,
                    border: `1px solid ${colors.gray}`,
                  }}
                >
                  HR
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                    {data.teachers.homeroom}
                  </div>
                  <div style={{ fontSize: 12, color: "#888" }}>
                    Homeroom Teacher
                  </div>
                </div>
              </div>
            )}
            {data.teachers.instructor.map((t, i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "center", gap: 12 }}
              >
                <img
                  src={t.imageURL}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: `1px solid ${colors.gray}`,
                  }}
                />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>
                    Subject Instructor ({t.email})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance & Grade Summary */}
        <div
          style={{
            background: colors.background,
            borderRadius: 16,
            padding: 20,
            border: `1px solid ${colors.gray}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: colors.icon }}>
              Attendance
            </div>
            <div
              style={{
                fontSize: 13,
                color: colors.primary,
                fontWeight: 700,
                background: "#fff",
                padding: "4px 12px",
                borderRadius: 20,
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              {data.attendance.status}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {data.attendance.summary.map((s, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  borderRadius: 10,
                  padding: "10px 8px",
                  flex: 1,
                  textAlign: "center",
                  border: `1px solid ${colors.gray}`,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "#888",
                    marginBottom: 4,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {s.status}
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: colors.primary,
                  }}
                >
                  {s.value}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#666",
              textAlign: "right",
              marginTop: -10,
              marginBottom: 10,
            }}
          >
            Total Hours: {data.attendance.totalHours}
          </div>

          <div
            style={{
              borderTop: `1px dashed ${colors.primary}40`,
              paddingTop: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{ fontSize: 14, fontWeight: 700, color: colors.icon }}
                >
                  Overall Grade
                </div>
                <div style={{ fontSize: 12, color: "#888" }}>
                  Score: {data.academicPerformance.overallScore} /{" "}
                  {data.academicPerformance.maxScore}
                </div>
              </div>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  color: colors.success,
                  lineHeight: 1,
                }}
              >
                {data.academicPerformance.overallGrade}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Skills Pie Chart */}
      <div style={{ width: 280 }}>
        <h3
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: colors.primary,
            marginBottom: 12,
            borderBottom: `1px solid ${colors.gray}`,
            paddingBottom: 8,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: colors.secondary,
            }}
          ></span>
          {data.skillAssessment.title || "Skills Assessment"}
        </h3>
        <div
          style={{
            position: "relative",
            height: 220,
            display: "flex",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          {/* SVG Pie Chart Implementation */}
          <svg width="220" height="220" viewBox="0 0 220 220">
            {(() => {
              const chartColors = [
                colors.primary,
                colors.secondary,
                colors.info,
                colors.success,
                colors.warning,
                colors.icon,
                "#A0A0A0",
              ];
              const skills = data.skillAssessment.skills;
              const total =
                skills.reduce((acc, item) => (acc += item.percentage), 0) || 1;
              let startAngle = 0;
              const cx = 110,
                cy = 110,
                rOuter = 100,
                rInner = 60;

              return skills.map((s, i) => {
                const angle = (s.percentage / total) * 360;
                if (angle <= 0) return null;
                const endAngle = startAngle + angle;
                const rad = (d: number) => (Math.PI / 180) * d;
                const x1 = cx + rOuter * Math.cos(rad(startAngle - 90));
                const y1 = cy + rOuter * Math.sin(rad(startAngle - 90));
                const x2 = cx + rOuter * Math.cos(rad(endAngle - 90));
                const y2 = cy + rOuter * Math.sin(rad(endAngle - 90));
                const x3 = cx + rInner * Math.cos(rad(endAngle - 90));
                const y3 = cy + rInner * Math.sin(rad(endAngle - 90));
                const x4 = cx + rInner * Math.cos(rad(startAngle - 90));
                const y4 = cy + rInner * Math.sin(rad(startAngle - 90));

                const largeArc = angle > 180 ? 1 : 0;

                const pathData = [
                  `M ${x1} ${y1}`,
                  `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2}`,
                  `L ${x3} ${y3}`,
                  `A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4} ${y4}`,
                  "Z",
                ].join(" ");
                const fill = chartColors[i % chartColors.length];
                startAngle += angle;
                return (
                  <path
                    key={i}
                    d={pathData}
                    fill={fill}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                );
              });
            })()}
            {/* Center Text */}
            <circle cx="110" cy="110" r="55" fill="#fff" />
            <text
              x="110"
              y="110"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="14"
              fill={colors.text}
              fontWeight="700"
            >
              SKILLS
            </text>
          </svg>
        </div>
        {/* Legend */}
        <div>
          {data.skillAssessment.skills.map((s, i) => {
            const chartColors = [
              colors.primary,
              colors.secondary,
              colors.info,
              colors.success,
              colors.warning,
              colors.icon,
              "#A0A0A0",
            ];
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                  fontSize: 12,
                  paddingBottom: 4,
                  borderBottom: `1px solid ${colors.background}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 3,
                      background: chartColors[i % chartColors.length],
                    }}
                  ></div>
                  <div
                    style={{
                      color: colors.text,
                      fontWeight: 500,
                      maxWidth: 180,
                    }}
                  >
                    {s.skill}
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: colors.primary }}>
                  {s.percentage.toFixed(2)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>

    {/* Assessments Table */}
    <div style={{ padding: "0 40px", marginTop: 24 }}>
      <h3
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: colors.primary,
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: colors.secondary,
          }}
        ></span>
        Academic Performance
      </h3>
      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
      >
        <thead>
          <tr style={{ background: colors.background }}>
            <th
              style={{
                textAlign: "left",
                padding: "12px 16px",
                borderRadius: "8px 0 0 8px",
                color: colors.text,
                fontWeight: 600,
                width: "60%",
              }}
            >
              Assessment Item
            </th>
            <th
              style={{
                textAlign: "right",
                padding: "12px 16px",
                borderRadius: "0 8px 8px 0",
                color: colors.text,
                fontWeight: 600,
              }}
            >
              Score
            </th>
          </tr>
        </thead>
        <tbody>
          {data.academicPerformance.assessments.map((a, i) => {
            let displayScore = `${a.score}`;
            if (a.maxScore !== "-") {
              let score = a.score;
              const maxScore = Number(a.maxScore);
              if (a.weight !== null && a.weight !== undefined) {
                const w = a.weight ?? 0;
                const weightVal = w > 0 ? w : a.maxScore;
                const ratio =
                  maxScore > 0
                    ? (score > maxScore ? maxScore : score) / maxScore
                    : 0;
                const weightedScore = ratio * Number(weightVal);

                displayScore = `${parseFloat(weightedScore.toFixed(2))} / ${weightVal}`;
              } else {
                displayScore = `${score} / ${a.maxScore}`;
              }
            }

            return (
              <tr
                key={i}
                style={{
                  borderBottom: `1px solid ${colors.background}`,
                  background: i % 2 === 0 ? "#fff" : "#fafafa",
                }}
              >
                <td style={{ padding: "12px 16px", color: colors.text }}>
                  {i + 1}. {a.item}
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    textAlign: "right",
                    fontWeight: 600,
                    color: colors.primary,
                  }}
                >
                  {displayScore}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    {/* Footer: Recommendations & Signature */}
    <div
      style={{
        padding: "32px 40px",
        marginTop: 10,
        display: "flex",
        gap: 48,
        alignItems: "flex-end",
        pageBreakInside: "avoid",
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: colors.primary,
            marginBottom: 8,
          }}
        >
          Teachers' Comments
        </div>
        <div
          style={{
            border: `1px solid ${colors.secondary}66`,
            background: `${colors.background}66`,
            borderRadius: 12,
            height: 100,
            padding: 16,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 35,
              left: 16,
              right: 16,
              height: 1,
              borderTop: `1px dashed ${colors.primary}33`,
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              top: 70,
              left: 16,
              right: 16,
              height: 1,
              borderTop: `1px dashed ${colors.primary}33`,
            }}
          ></div>
          {/* <div style={{ fontSize: 13, color: colors.text }}>
             {data.recommendations}
          </div> */}
        </div>
      </div>
      <div style={{ width: 220, textAlign: "center" }}>
        <div
          style={{
            borderBottom: `1px solid ${colors.icon}`,
            marginBottom: 8,
            height: 40,
          }}
        ></div>
        <div style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>
          {data.signatureFields?.name ||
            data.teachers.instructor[0]?.name ||
            "Instructor"}
        </div>
        <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
          {data.signatureFields?.position || "Instructor"}
        </div>
      </div>
    </div>

    {/* Decorative bottom bar */}
    <div
      style={{
        height: 12,
        background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
        marginTop: 0,
        width: "100%",
        position: "absolute",
        bottom: 0,
      }}
    ></div>
  </div>
));
StudentReportHTML.displayName = "StudentReportHTML";
