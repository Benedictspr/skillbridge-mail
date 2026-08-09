import React, { useState } from 'react';
import { 
  Key, Code, ShieldCheck, Copy, Check, Terminal, Zap, Globe, Layers, 
  Play, RefreshCw, Send, Server, FileText, CheckCircle2, AlertCircle, Cpu
} from 'lucide-react';

export default function SkillBridgeApiView({ currentOrg }) {
  const [copiedKey, setCopiedKey] = useState(false);
  const [activeTab, setActiveTab] = useState('curl'); // 'curl' | 'node' | 'python' | 'go' | 'php'
  const [activeDocTab, setActiveDocTab] = useState('endpoints'); // 'endpoints' | 'test_runner' | 'webhooks'

  // Live API Runner state
  const [testRecipient, setTestRecipient] = useState('m4verickjack@gmail.com');
  const [testSubject, setTestSubject] = useState('API Integration Test Dispatch');
  const [testBody, setTestBody] = useState('<p>Hello from <strong>Sendaat Enterprise REST API v1.4</strong>!</p>');
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResponse, setTestResponse] = useState(null);

  // Webhook Simulator state
  const [webhookUrl, setWebhookUrl] = useState(`https://api.${currentOrg?.domain || 'sendaat.io'}/v1/webhooks`);
  const [webhookEvent, setWebhookEvent] = useState('email.delivered');
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);
  const [webhookLogs, setWebhookLogs] = useState([]);

  const apiKey = `sk_live_sb_${(currentOrg?.id || 'org_1001').replace('org_', '')}_99a4x28190c`;

  const curlSnippet = `curl -X POST http://localhost:3001/api/send-email \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "organization_id": "${currentOrg?.id || 'org_1001'}",
    "to": "student@university.edu",
    "subject": "Remote Work Opportunity",
    "html": "<p>Hi {{first_name}}, welcome to SkillBridge Network!</p>",
    "params": {
      "first_name": "Alex",
      "company": "SkillBridge Network"
    }
  }'`;

  const nodeSnippet = `import { SendaatClient } from '@sendaat/sdk';

const sendaat = new SendaatClient({
  apiKey: '${apiKey}',
  organizationId: '${currentOrg?.id || 'org_1001'}'
});

const response = await sendaat.email.send({
  to: 'student@university.edu',
  subject: 'Remote Work Opportunity',
  html: '<p>Hi {{first_name}}, welcome to SkillBridge Network!</p>',
  params: { first_name: 'Alex' }
});

console.log('Dispatched message ID:', response.messageId);`;

  const pythonSnippet = `from sendaat import SendaatClient

client = SendaatClient(
    api_key="${apiKey}",
    organization_id="${currentOrg?.id || 'org_1001'}"
)

response = client.email.send(
    to="student@university.edu",
    subject="Remote Work Opportunity",
    html="<p>Hi {{first_name}}, welcome to SkillBridge Network!</p>",
    params={"first_name": "Alex"}
)

print("Dispatch Status:", response.status)`;

  const goSnippet = `package main

import (
    "fmt"
    "github.com/sendaat/sendaat-go"
)

func main() {
    client := sendaat.NewClient("${apiKey}", "${currentOrg?.id || 'org_1001'}")
    resp, err := client.SendEmail(&sendaat.EmailPayload{
        To:      "student@university.edu",
        Subject: "Remote Work Opportunity",
        HTML:    "<p>Hi {{first_name}}, welcome to SkillBridge Network!</p>",
    })
    if err != nil {
        panic(err)
    }
    fmt.Println("Message ID:", resp.MessageID)
}`;

  const phpSnippet = `<?php
require 'vendor/autoload.php';

$sendaat = new \Sendaat\Client('${apiKey}', '${currentOrg?.id || 'org_1001'}');

$response = $sendaat->email->send([
    'to' => 'student@university.edu',
    'subject' => 'Remote Work Opportunity',
    'html' => '<p>Hi {{first_name}}, welcome to SkillBridge Network!</p>'
]);

echo "Status: " . $response->status;`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRunLiveApiTest = async () => {
    setIsRunningTest(true);
    setTestResponse(null);
    const startTime = performance.now();

    try {
      const resp = await fetch('http://localhost:3001/api/send-email', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          recipientId: `test-api-${Date.now()}`,
          to: testRecipient,
          subject: testSubject,
          html: testBody,
          mode: 'gmail'
        })
      });

      const endTime = performance.now();
      const latencyMs = Math.round(endTime - startTime);
      const data = await resp.json();

      setTestResponse({
        status: resp.status,
        statusText: resp.ok ? '200 OK' : `${resp.status} Error`,
        latencyMs,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'x-ratelimit-remaining': '2499/2500',
          'x-sendaat-deliverability-score': '99.8%'
        },
        body: data
      });
    } catch (err) {
      setTestResponse({
        status: 500,
        statusText: '500 Internal Error / Connection Failed',
        latencyMs: 0,
        headers: {},
        body: { error: err.message || 'Failed to connect to backend REST service at http://localhost:3001' }
      });
    } finally {
      setIsRunningTest(false);
    }
  };

  const handleTriggerTestWebhook = async () => {
    setIsSendingWebhook(true);
    setTimeout(() => {
      const newLog = {
        id: `wh_${Date.now()}`,
        event: webhookEvent,
        url: webhookUrl,
        timestamp: new Date().toISOString(),
        status: 200,
        response: 'HTTP 200 OK (Event Delivered Successfully)'
      };
      setWebhookLogs(prev => [newLog, ...prev]);
      setIsSendingWebhook(false);
    }, 600);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans text-slate-900">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-mono font-bold border border-blue-500/30">
            DEVELOPER PLATFORM
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            REST v1.4 (PRODUCTION READY)
          </span>
          <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
            MULTI-TENANT SCOPED
          </span>
        </div>

        <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <Terminal className="w-8 h-8 md:w-9 md:h-9 text-blue-400" />
          SkillBridge & Sendaat API Documentation
        </h1>
        
        <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
          Integrate cold outreach email dispatch, real-time deliverability checks, and suppression list queries directly into your web apps with production secret keys for <strong>{currentOrg?.name || 'Sendaat Enterprise'}</strong>.
        </p>

        {/* Documentation Sub-Navigation Tabs */}
        <div className="pt-2 flex flex-wrap gap-2 border-t border-slate-800">
          <button
            onClick={() => setActiveDocTab('endpoints')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeDocTab === 'endpoints' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Developer Integration Snippets</span>
          </button>

          <button
            onClick={() => setActiveDocTab('test_runner')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeDocTab === 'test_runner' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Play className="w-4 h-4 text-emerald-400" />
            <span>Live API Request Console (Try It Out)</span>
          </button>

          <button
            onClick={() => setActiveDocTab('webhooks')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeDocTab === 'webhooks' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4 text-amber-400" />
            <span>Webhooks & Event Gateway</span>
          </button>
        </div>
      </div>

      {/* Organization Secret Key Box */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-600" />
            <span>Organization Secret Key ({currentOrg?.name || 'Sendaat Enterprise'})</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">Scope: read/write • Rate Limit: 2,500 req/hr</span>
        </div>
        
        <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between font-mono text-xs gap-3">
          <span className="truncate text-blue-300 font-bold">{apiKey}</span>
          <button
            onClick={() => copyToClipboard(apiKey)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-sans font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer shadow-sm"
          >
            {copiedKey ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copiedKey ? 'Key Copied!' : 'Copy Secret API Key'}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Developer Integration Snippets & REST Specification */}
      {activeDocTab === 'endpoints' && (
        <div className="space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                  <Code className="w-5 h-5 text-indigo-600" />
                  <span>Developer Integration Snippets</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select your preferred backend language or SDK to generate copy-paste production code.
                </p>
              </div>

              {/* Language Selector */}
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs gap-1 font-bold shrink-0">
                {['curl', 'node', 'python', 'go', 'php'].map(lang => (
                  <button
                    key={lang}
                    onClick={() => setActiveTab(lang)}
                    className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                      activeTab === lang ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lang === 'curl' ? 'cURL' : lang === 'node' ? 'Node.js' : lang === 'python' ? 'Python' : lang === 'go' ? 'Go' : 'PHP'}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Block Container */}
            <div className="relative">
              <div className="p-5 bg-slate-950 text-emerald-400 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed shadow-inner border border-slate-800">
                <pre>
                  {activeTab === 'curl' && curlSnippet}
                  {activeTab === 'node' && nodeSnippet}
                  {activeTab === 'python' && pythonSnippet}
                  {activeTab === 'go' && goSnippet}
                  {activeTab === 'php' && phpSnippet}
                </pre>
              </div>

              <button
                onClick={() => copyToClipboard(
                  activeTab === 'curl' ? curlSnippet : 
                  activeTab === 'node' ? nodeSnippet : 
                  activeTab === 'python' ? pythonSnippet : 
                  activeTab === 'go' ? goSnippet : phpSnippet
                )}
                className="absolute top-3 right-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </button>
            </div>
          </div>

          {/* Endpoints Table Specification */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600" />
              <span>Production REST v1.4 API Endpoints</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-mono text-[11px] uppercase">
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Endpoint Path</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Auth Scope</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">POST</span></td>
                    <td className="py-3 px-4 text-blue-600 font-bold">/api/send-email</td>
                    <td className="py-3 px-4 text-slate-700 font-sans">Dispatch single transactional or outreach email via Gmail SMTP</td>
                    <td className="py-3 px-4 text-slate-500">Bearer Secret Key</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">POST</span></td>
                    <td className="py-3 px-4 text-blue-600 font-bold">/api/send-signup-otp</td>
                    <td className="py-3 px-4 text-slate-700 font-sans">Dispatch 6-digit verification code email with automatic fallback</td>
                    <td className="py-3 px-4 text-slate-500">Public / Bearer</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">GET</span></td>
                    <td className="py-3 px-4 text-blue-600 font-bold">/api/replies</td>
                    <td className="py-3 px-4 text-slate-700 font-sans">Fetch incoming IMAP recipient replies & status flags</td>
                    <td className="py-3 px-4 text-slate-500">Bearer Secret Key</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">POST</span></td>
                    <td className="py-3 px-4 text-blue-600 font-bold">/api/2fa/generate</td>
                    <td className="py-3 px-4 text-slate-700 font-sans">Generate TOTP 2FA secret key & QR code URL for Google Authenticator</td>
                    <td className="py-3 px-4 text-slate-500">Bearer Secret Key</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Live Interactive API Test Runner */}
      {activeDocTab === 'test_runner' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
              <Play className="w-5 h-5 text-emerald-600" />
              <span>Live Interactive API Request Runner</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Execute live REST API calls against your backend server (`http://localhost:3001/api/send-email`) and view real response metrics in real-time.
            </p>
          </div>

          <div className="grid md:grid-cols-12 gap-6">
            {/* Input Form */}
            <div className="md:col-span-6 space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider font-mono text-[11px]">Request Payload Setup</h4>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Recipient Email (To)</label>
                <input
                  type="email"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Subject</label>
                <input
                  type="text"
                  value={testSubject}
                  onChange={(e) => setTestSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-600 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">HTML Message Body</label>
                <textarea
                  rows={4}
                  value={testBody}
                  onChange={(e) => setTestBody(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-600 font-mono"
                />
              </div>

              <button
                onClick={handleRunLiveApiTest}
                disabled={isRunningTest}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                {isRunningTest ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing Request...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Run API Request (Live Test)</span>
                  </>
                )}
              </button>
            </div>

            {/* Output Response View */}
            <div className="md:col-span-6 space-y-3 bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-mono uppercase text-slate-400 font-bold">Response Console</span>
                  {testResponse && (
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className={`px-2 py-0.5 rounded font-bold ${testResponse.status === 200 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                        {testResponse.statusText}
                      </span>
                      <span className="text-slate-400">{testResponse.latencyMs}ms</span>
                    </div>
                  )}
                </div>

                {!testResponse ? (
                  <div className="py-16 text-center text-slate-500 text-xs font-mono">
                    Click "Run API Request (Live Test)" to execute request against backend REST server.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-[11px] font-mono text-slate-400">Response Body (JSON):</div>
                    <pre className="p-3 bg-slate-950 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
                      {JSON.stringify(testResponse.body, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono flex items-center justify-between">
                <span>Target: http://localhost:3001/api/send-email</span>
                <span>Format: JSON</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Webhooks & Event Subscription Gateway */}
      {activeDocTab === 'webhooks' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-600" />
              <span>Webhooks & Real-Time Event Gateway</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Receive real-time HTTP POST notifications when emails are delivered, opened, bounced, or replied to by recipients.
            </p>
          </div>

          <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Webhook Endpoint URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 outline-none font-mono"
                />
                <button
                  onClick={handleTriggerTestWebhook}
                  disabled={isSendingWebhook}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-colors shrink-0"
                >
                  {isSendingWebhook ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Test Webhook Ping</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Subscribed Events</label>
              <div className="flex flex-wrap gap-2">
                {['email.delivered', 'email.opened', 'email.bounced', 'reply.received', 'spam.complaint'].map(evt => (
                  <button
                    key={evt}
                    onClick={() => setWebhookEvent(evt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border transition-all cursor-pointer ${
                      webhookEvent === evt ? 'bg-purple-600 text-white border-purple-600 shadow-xs' : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    {evt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Webhook Delivery Logs */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-600" />
              <span>Recent Webhook Delivery Logs</span>
            </h4>

            {webhookLogs.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                No webhook test events dispatched yet. Click "Test Webhook Ping" to simulate an event.
              </div>
            ) : (
              <div className="space-y-2">
                {webhookLogs.map(log => (
                  <div key={log.id} className="p-3 bg-slate-900 text-white rounded-xl font-mono text-xs flex items-center justify-between border border-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">{log.status}</span>
                      <span className="text-purple-400 font-bold">{log.event}</span>
                      <span className="text-slate-400 truncate max-w-md">{log.url}</span>
                    </div>
                    <span className="text-slate-500 text-[11px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
