// Load auth before api-service: the two import each other, and under CommonJS (tsx --test)
// only this order resolves (webpack's ESM build hoists either way).
import "../../services/auth";
import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterContext } from "next/dist/shared/lib/router-context.shared-runtime";
import { Language, LineGroupOnSubject } from "../../interfaces";
import { keyLineGroup } from "../../react-query/line-group";
import { lineGroupLanguage } from "../../data/languages";
import LineGroupSettings from "./LineGroupSettings";
import QrCodeLineConnect from "./QrCodeLineConnect";
import VerifyConnectLine from "./VerifyConnectLine";

function link(overrides: Partial<LineGroupOnSubject>): LineGroupOnSubject {
  return {
    id: "link-1",
    createAt: "2026-11-25T08:00:00.000Z",
    updateAt: "2026-11-25T08:00:00.000Z",
    lineGroupId: "C123a91f",
    groupName: "ม.2/1 นักเรียน",
    isVerify: true,
    verifyToken: null,
    verifyExpireAt: null,
    verifiedAt: "2026-11-25T08:05:00.000Z",
    allowAssignment: true,
    allowMorningSummary: true,
    allowAnnouncement: true,
    allowAi: true,
    subjectId: "s1",
    schoolId: "school-1",
    ...overrides,
  };
}

const pendingLink = (overrides: Partial<LineGroupOnSubject> = {}) =>
  link({
    id: "pending-1",
    lineGroupId: "Cffff0a91f",
    groupName: null,
    isVerify: false,
    verifyToken: "tok",
    verifyExpireAt: "2026-11-26T08:00:00.000Z",
    verifiedAt: null,
    ...overrides,
  });

function render(
  node: React.ReactNode,
  links: LineGroupOnSubject[] | undefined,
  language: Language = "en",
) {
  const client = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } },
  });
  client.setQueryData(["language"], language);
  if (links) {
    client.setQueryData(
      keyLineGroup.getBySubjectId({ subjectId: "s1" }),
      links,
    );
  }
  return renderToStaticMarkup(
    <RouterContext.Provider value={{ push: async () => true } as any}>
      <QueryClientProvider client={client}>{node}</QueryClientProvider>
    </RouterContext.Provider>,
  );
}

const count = (html: string, needle: string) => html.split(needle).length - 1;
const buttons = (html: string) =>
  html.match(/<button[^>]*>.*?<\/button>/gs) ?? [];
const button = (html: string, label: string) =>
  buttons(html).filter((b) => b.replace(/<[^>]+>/g, "").trim() === label);
const switches = (html: string) =>
  html.match(/<input[^>]*role="switch"[^>]*>/g) ?? [];
const isOn = (input: string) => /aria-checked="true"/.test(input);
const isDisabled = (tag: string) => /\sdisabled=""/.test(tag);

// ---- strings: the plan's copy, both languages ----

test("LINE group strings: Thai and English copy from the plan", () => {
  const expected: [keyof typeof lineGroupLanguage, string, string][] = [
    ["title", "กลุ่ม LINE", "LINE groups"],
    ["connectAnother", "เชื่อมต่อกลุ่มเพิ่ม", "Connect another group"],
    ["allowAssignment", "งานใหม่", "New assignment"],
    ["allowMorningSummary", "สรุปยามเช้า", "Morning summary"],
    ["allowAnnouncement", "ประกาศ", "Announcement"],
    ["allowAi", "ถามตอบ AI", "AI questions"],
    ["disconnect", "ยกเลิกการเชื่อมต่อ", "Disconnect"],
    ["waiting", "รอการยืนยัน", "Waiting for confirmation"],
    ["later", "ไว้ทีหลัง", "Later"],
    ["manageInSettings", "จัดการในหน้าตั้งค่า", "Manage in settings"],
    ["empty", "ยังไม่ได้เชื่อมต่อกลุ่ม LINE", "No LINE group connected yet"],
    [
      "warning",
      "ยืนยันเฉพาะเมื่อคุณเป็นผู้เพิ่มบอทเข้ากลุ่มนี้เอง กลุ่มนี้จะได้รับการแจ้งเตือนของรายวิชา และสามารถถาม AI เกี่ยวกับคะแนนของนักเรียนได้",
      "Only confirm if you added the bot to this group yourself. This group will receive this subject's notifications and can ask the AI about students' scores.",
    ],
  ];
  for (const [key, th, en] of expected) {
    const entry = lineGroupLanguage[key] as (language: Language) => string;
    assert.equal(entry("th"), th, `${key} (th)`);
    assert.equal(entry("en"), en, `${key} (en)`);
  }
});

test("LINE group strings: every entry has a non-empty, distinct Thai and English text", () => {
  for (const [key, entry] of Object.entries(lineGroupLanguage)) {
    const fn = entry as (language: Language, name: string) => string;
    const th = fn("th", "G");
    const en = fn("en", "G");
    assert.ok(th.trim().length > 0, `${key} (th) is empty`);
    assert.ok(en.trim().length > 0, `${key} (en) is empty`);
    assert.notEqual(th, en, `${key} is not translated`);
  }
});

// ---- LineGroupSettings ----

test("settings: zero groups shows the empty state with one connect button, and no cards", () => {
  const html = render(<LineGroupSettings subjectId="s1" />, []);
  assert.ok(html.includes("No LINE group connected yet"));
  assert.equal(button(html, "Connect another group").length, 1);
  assert.equal(switches(html).length, 0);
  assert.equal(button(html, "Disconnect").length, 0);
  assert.ok(!html.includes("aria-busy"));
});

test("settings: zero groups in Thai", () => {
  const html = render(<LineGroupSettings subjectId="s1" />, [], "th");
  assert.ok(html.includes("ยังไม่ได้เชื่อมต่อกลุ่ม LINE"));
  assert.equal(button(html, "เชื่อมต่อกลุ่มเพิ่ม").length, 1);
  assert.ok(html.includes("กลุ่ม LINE"));
});

test("settings: before the list has loaded it shows a skeleton, not the empty state", () => {
  const html = render(<LineGroupSettings subjectId="s1" />, undefined);
  assert.ok(html.includes("aria-busy"));
  assert.ok(html.includes("animate-pulse"));
  assert.ok(!html.includes("No LINE group connected yet"));
});

test("settings: one verified group renders its name, four labelled switches and a Disconnect button", () => {
  const html = render(<LineGroupSettings subjectId="s1" />, [link({})]);
  assert.ok(html.includes("ม.2/1 นักเรียน"));
  for (const label of [
    "New assignment",
    "Morning summary",
    "Announcement",
    "AI questions",
  ]) {
    assert.equal(count(html, `>${label}<`), 1, label);
  }
  assert.equal(switches(html).length, 4);
  assert.ok(switches(html).every(isOn));
  assert.equal(button(html, "Disconnect").length, 1);
  assert.equal(button(html, "Connect another group").length, 1);
  assert.ok(!html.includes("No LINE group connected yet"));
  // The destructive confirm step is not open until Disconnect is pressed.
  assert.ok(!html.includes("Are you sure you want to disconnect?"));
});

test("settings: each card shows its own link's switches (parents group differs from students group)", () => {
  const html = render(<LineGroupSettings subjectId="s1" />, [
    link({ id: "students" }),
    link({
      id: "parents",
      lineGroupId: "Cparents",
      groupName: "ม.2/1 ผู้ปกครอง",
      allowAssignment: false,
      allowAi: false,
    }),
  ]);
  // Order on screen: assignment, morning summary, announcement, AI — per card.
  assert.deepEqual(switches(html).map(isOn), [
    true,
    true,
    true,
    true,
    false,
    true,
    true,
    false,
  ]);
  assert.equal(button(html, "Disconnect").length, 2);
  assert.ok(html.indexOf("ม.2/1 นักเรียน") < html.indexOf("ม.2/1 ผู้ปกครอง"));
});

test("settings: every switch off renders four unchecked switches, none disabled", () => {
  const html = render(<LineGroupSettings subjectId="s1" />, [
    link({
      allowAssignment: false,
      allowMorningSummary: false,
      allowAnnouncement: false,
      allowAi: false,
    }),
  ]);
  assert.deepEqual(switches(html).map(isOn), [false, false, false, false]);
  assert.ok(!switches(html).some(isDisabled));
});

test("settings: two verified + one pending — the pending card waits for confirmation and has no switches", () => {
  const html = render(<LineGroupSettings subjectId="s1" />, [
    link({ id: "a" }),
    link({ id: "b", lineGroupId: "Cb", groupName: "ม.2/1 ผู้ปกครอง" }),
    pendingLink(),
  ]);
  assert.equal(switches(html).length, 8);
  assert.equal(button(html, "Disconnect").length, 2);
  assert.equal(count(html, "Waiting for confirmation"), 1);
  assert.ok(html.includes("LINE group …a91f"));
  const confirm = button(html, "Confirm");
  const cancel = button(html, "Cancel");
  assert.equal(confirm.length, 1);
  assert.equal(cancel.length, 1);
  assert.ok(!isDisabled(confirm[0]));
  assert.ok(!isDisabled(cancel[0]));
});

test("settings: only pending links — no switches, no Disconnect, not the empty state", () => {
  const html = render(<LineGroupSettings subjectId="s1" />, [
    pendingLink({ id: "p1" }),
    pendingLink({ id: "p2", lineGroupId: "Cp2bbbb" }),
    pendingLink({ id: "p3", lineGroupId: "Cp3cccc" }),
  ]);
  assert.equal(switches(html).length, 0);
  assert.equal(button(html, "Disconnect").length, 0);
  assert.equal(count(html, "Waiting for confirmation"), 3);
  assert.equal(button(html, "Confirm").length, 3);
  assert.ok(!html.includes("No LINE group connected yet"));
});

test("settings: a pending link without a token cannot be confirmed or cancelled from the card", () => {
  const html = render(<LineGroupSettings subjectId="s1" />, [
    pendingLink({ verifyToken: null }),
  ]);
  assert.ok(isDisabled(button(html, "Confirm")[0]));
  assert.ok(isDisabled(button(html, "Cancel")[0]));
});

test("settings: ten verified groups (the cap) all render", () => {
  const links = Array.from({ length: 10 }, (_, i) =>
    link({ id: `l${i}`, lineGroupId: `Cgroup${i}`, groupName: `Group ${i}` }),
  );
  const html = render(<LineGroupSettings subjectId="s1" />, links);
  assert.equal(switches(html).length, 40);
  assert.equal(button(html, "Disconnect").length, 10);
  for (let i = 0; i < 10; i++) assert.ok(html.includes(`>Group ${i}<`));
});

test("settings: a 100-character name is truncated by CSS and kept whole in the title", () => {
  const long = "ก".repeat(100);
  for (const links of [
    [link({ groupName: long })],
    [pendingLink({ groupName: long })],
  ]) {
    const html = render(<LineGroupSettings subjectId="s1" />, links);
    assert.match(
      html,
      new RegExp(`<span title="${long}" class="[^"]*\\btruncate\\b[^"]*">`),
    );
  }
});

test("settings: a blank name falls back to the id tail in the viewer's language", () => {
  const links = [link({ groupName: "   ", lineGroupId: "Cxxxx9z8y" })];
  assert.ok(
    render(<LineGroupSettings subjectId="s1" />, links, "en").includes(
      "LINE group …9z8y",
    ),
  );
  assert.ok(
    render(<LineGroupSettings subjectId="s1" />, links, "th").includes(
      "กลุ่ม LINE …9z8y",
    ),
  );
});

test("settings: a group name containing markup is shown as text", () => {
  const html = render(<LineGroupSettings subjectId="s1" />, [
    link({ groupName: '<img src=x onerror="alert(1)">' }),
  ]);
  assert.ok(!html.includes("<img src=x"));
  assert.ok(html.includes("&lt;img src=x"));
});

test("settings: links of another subject are not shown", () => {
  const client = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } },
  });
  client.setQueryData(["language"], "en");
  client.setQueryData(keyLineGroup.getBySubjectId({ subjectId: "s1" }), []);
  client.setQueryData(keyLineGroup.getBySubjectId({ subjectId: "s2" }), [
    link({ subjectId: "s2", groupName: "Other subject group" }),
  ]);
  const html = renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <LineGroupSettings subjectId="s1" />
    </QueryClientProvider>,
  );
  assert.ok(!html.includes("Other subject group"));
  assert.ok(html.includes("No LINE group connected yet"));
});

// ---- VerifyConnectLine ----

const noop = () => {};

test("confirm popup: names the group, warns, and offers Confirm, Deny and Later", () => {
  const html = render(
    <VerifyConnectLine
      link={pendingLink({ groupName: "ม.2/1 ผู้ปกครอง" })}
      subjectId="s1"
      onLater={noop}
    />,
    undefined,
  );
  assert.ok(
    html.includes("Connect this subject to LINE group «ม.2/1 ผู้ปกครอง»?"),
  );
  assert.match(
    html,
    /<div role="alert"[^>]*>Only confirm if you added the bot to this group yourself\. This group will receive this subject&#x27;s notifications and can ask the AI about students&#x27; scores\.<\/div>/,
  );
  for (const label of ["Confirm", "Deny", "Later"]) {
    const found = button(html, label);
    assert.equal(found.length, 1, label);
    assert.ok(!isDisabled(found[0]), label);
  }
});

test("confirm popup: an unnamed group is named by its id tail; Thai copy", () => {
  const html = render(
    <VerifyConnectLine link={pendingLink()} subjectId="s1" onLater={noop} />,
    undefined,
    "th",
  );
  assert.ok(
    html.includes(
      "เชื่อมต่อรายวิชานี้กับกลุ่ม LINE «กลุ่ม LINE …a91f» หรือไม่?",
    ),
  );
  assert.ok(html.includes(lineGroupLanguage.warning("th")));
  assert.equal(button(html, "ยืนยัน").length, 1);
  assert.equal(button(html, "ปฏิเสธ").length, 1);
  assert.equal(button(html, "ไว้ทีหลัง").length, 1);
});

test("confirm popup: a very long or markup-laden group name stays inside a clamped, escaped line", () => {
  const long = "x".repeat(100);
  const html = render(
    <VerifyConnectLine
      link={pendingLink({ groupName: `<b>${long}</b>` })}
      subjectId="s1"
      onLater={noop}
    />,
    undefined,
  );
  assert.ok(!html.includes(`<b>${long}`));
  assert.ok(html.includes(`«&lt;b&gt;${long}&lt;/b&gt;»`));
  assert.match(
    html,
    /<p title="[^"]*" class="[^"]*line-clamp-3[^"]*break-words/,
  );
});

// ---- QrCodeLineConnect ----

test("connect popup: with no verified group it shows only the QR and steps", () => {
  for (const links of [[], [pendingLink()]]) {
    const html = render(<QrCodeLineConnect subjectId="s1" />, links);
    assert.ok(html.includes('alt="Line QR Code"'));
    assert.ok(html.includes("Invite Tatuga School to group chat"));
    assert.ok(!html.includes("Connected groups"));
    assert.equal(button(html, "Manage in settings").length, 0);
    assert.ok(!html.includes("LINE group …a91f"));
  }
});

test("connect popup: with verified groups it lists them above the QR, which is still there", () => {
  const html = render(<QrCodeLineConnect subjectId="s1" />, [
    link({ id: "a" }),
    link({ id: "b", lineGroupId: "Cb", groupName: null }),
    pendingLink({ groupName: "Not confirmed yet" }),
  ]);
  assert.ok(html.includes("Connected groups (2)"));
  assert.ok(html.includes("ม.2/1 นักเรียน"));
  assert.ok(html.includes("LINE group …Cb"));
  assert.ok(!html.includes("Not confirmed yet"));
  assert.equal(button(html, "Manage in settings").length, 1);
  assert.ok(html.includes('alt="Line QR Code"'));
  assert.ok(
    html.indexOf("Connected groups") < html.indexOf('alt="Line QR Code"'),
  );
  // The single-group disconnect flow is gone from this popup.
  assert.equal(button(html, "Disconnect").length, 0);
  assert.ok(!/disconnect/i.test(html));
});

test("connect popup: the close button appears only when it can close", () => {
  const without = render(<QrCodeLineConnect subjectId="s1" />, []);
  const withClose = render(
    <QrCodeLineConnect subjectId="s1" onClose={noop} />,
    [],
  );
  assert.equal(buttons(without).length, 0);
  assert.equal(buttons(withClose).length, 1);
});
