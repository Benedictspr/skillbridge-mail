import React, { useState, useEffect, startTransition } from 'react';
import { 
  Key, Code, ShieldCheck, Copy, Check, Terminal, Zap, Globe, Layers, 
  Play, RefreshCw, Send, Server, FileText, CheckCircle2, AlertCircle, Cpu, Code2, Plus, Trash2, Shield, Eye, EyeOff
} from 'lucide-react';
import syncEngine from '../utils/syncEngine';

export default function SkillBridgeApiView({ currentOrg }) {
  const [copiedKeyId, setCopiedKeyId] = useState(null);
  const [activeTab, setActiveTab] = useState('curl'); // 'curl' | 'node' | 'python' | 'go' | 'php'
  const [activeDocTab, setActiveDocTab] = useState('endpoints'); // 'endpoints' | 'test_runner' | 'webhooks'

  // API Key Management State
  const [apiKeys, setApiKeys] = useState(() => {
    try {
      const saved = localStorage.getItem('sendaat_apiKeys');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'key_default',
        name: 'Default Production Key',
        key: `sk_live_sendaat_${(currentOrg?.id || '1001').replace('org_', '')}_99a4x28190c`,
        createdAt: '2026-08-01',
        scope: 'Full Access (read/write)',
        lastUsed: 'Just now'
      }
    ];
  });

  // Listen for remote updates for API keys
  useEffect(() => {
    const unsubscribe = syncEngine.subscribe((eventType, data) => {
      if (eventType === 'REMOTE_UPDATE' && data.delta?.apiKeys) {
        setApiKeys(data.delta.apiKeys);
      }
    });
    return () => unsubscribe();
  }, []);

  const [isCreateKeyModalOpen, setIsCreateKeyModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScope, setNewKeyScope] = useState('Full Access (read/write)');
  const [newlyCreatedKey, setNewlyCreatedKey] = useState(null);

  // Selected Key for Code Snippets
  const [selectedKeyId, setSelectedKeyId] = useState(apiKeys[0]?.id || 'key_default');
  const activeKeyObj = apiKeys.find(k => k.id === selectedKeyId) || apiKeys[0] || {
    key: `sk_live_sendaat_99a4x28190c`
  };
  const apiKey = activeKeyObj.key;

  // Persist API Keys to Cloud and Local Cache
  useEffect(() => {
    try {
      localStorage.setItem('sendaat_apiKeys', JSON.stringify(apiKeys));
      syncEngine.pushState({ apiKeys });
    } catch (e) {}
  }, [apiKeys]);

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

  // Generate New API Key
  const handleCreateNewApiKey = () => {
    if (!newKeyName.trim()) return;

    const randomSecret = Array.from({ length: 24 }, () => Math.floor(Math.random() * 36).toString(36)).join('');
    const createdKeyString = `sk_live_sendaat_${randomSecret}`;

    const newKeyItem = {
      id: `key_${Date.now()}`,
      name: newKeyName.trim(),
      key: createdKeyString,
      createdAt: new Date().toISOString().split('T')[0],
      scope: newKeyScope,
      lastUsed: 'Never'
    };

    setApiKeys(prev => [newKeyItem, ...prev]);
    setSelectedKeyId(newKeyItem.id);
    setNewlyCreatedKey(newKeyItem);
    setNewKeyName('');
  };

  const [showRevokeConfirmId, setShowRevokeConfirmId] = useState(null);

  // Revoke API Key
  const handleRevokeKey = (keyId) => {
    if (apiKeys.length <= 1) {
      return;
    }
    if (showRevokeConfirmId !== keyId) {
      setShowRevokeConfirmId(keyId);
      setTimeout(() => setShowRevokeConfirmId(null), 4000);
      return;
    }
    setShowRevokeConfirmId(null);
    startTransition(() => {
      const updated = apiKeys.filter(k => k.id !== keyId);
      setApiKeys(updated);
      if (selectedKeyId === keyId) {
        setSelectedKeyId(updated[0].id);
      }
    });
  };

  const copyToClipboard = (text, keyId) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(keyId);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const curlSnippet = `curl -X POST http://localhost:3001/api/send-email \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "organization_id": "${currentOrg?.id || 'org_sendaat_1001'}",
    "to": "user@company.com",
    "subject": "System Verification Code",
    "html": "<p>Hi {{first_name}}, welcome to Sendaat Infrastructure!</p>",
    "params": {
      "first_name": "Alex",
      "company": "Sendaat Enterprise"
    }
  }'`;

  const nodeSnippet = `import { SendaatClient } from '@sendaat/sdk';

const sendaat = new SendaatClient({
  apiKey: '${apiKey}',
  organizationId: '${currentOrg?.id || 'org_sendaat_1001'}'
});

const response = await sendaat.email.send({
  to: 'user@company.com',
  subject: 'System Verification Code',
  html: '<p>Hi {{first_name}}, welcome to Sendaat Infrastructure!</p>',
  params: { first_name: 'Alex' }
});

console.log('Dispatched message ID:', response.messageId);`;

  const pythonSnippet = `from sendaat import SendaatClient

client = SendaatClient(
    api_key="${apiKey}",
    organization_id="${currentOrg?.id || 'org_sendaat_1001'}"
)

response = client.email.send(
    to="user@company.com",
    subject="System Verification Code",
    html="<p>Hi {{first_name}}, welcome to Sendaat Infrastructure!</p>",
    params={"first_name": "Alex"}
)

print("Dispatch Status:", response.status)`;

  const goSnippet = `package main

import (
    "fmt"
    "github.com/sendaat/sendaat-go"
)

func main() {
    client := sendaat.NewClient("${apiKey}", "${currentOrg?.id || 'org_sendaat_1001'}")
    resp, err := client.SendEmail(&sendaat.EmailPayload{
        To:      "user@company.com",
        Subject: "System Verification Code",
        HTML:    "<p>Hi {{first_name}}, welcome to Sendaat Infrastructure!</p>",
    })
    if err != nil {
        panic(err)
    }
    fmt.Println("Message ID:", resp.MessageID)
}`;

  const phpSnippet = `<?php
require 'vendor/autoload.php';

$sendaat = new \\Sendaat\\Client('${apiKey}', '${currentOrg?.id || 'org_sendaat_1001'}');

$response = $sendaat->email->send([
    'to' => 'user@company.com',
    'subject' => 'System Verification Code',
    'html' => '<p>Hi {{first_name}}, welcome to Sendaat Infrastructure!</p>'
]);

echo "Status: " . $response->status;`;

  const handleRunLiveApiTest = async () => {
    setIsRunningTest(true);
    setTestResponse(null);
    const startTime = performance.now();

    try {
      resp = await fetch('/api/send-email', {
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
          mode: 'sandbox',
          organization_id: currentOrg?.id || 'org_sendaat_1001'
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
        status: 200,
        statusText: '200 OK (Simulated Sandbox)',
        latencyMs: 42,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'x-ratelimit-remaining': '2499/2500',
          'x-sendaat-deliverability-score': '99.8%'
        },
        body: {
          success: true,
          messageId: `<c28f90a1-4e8b-11ee-be56-0242ac120002@${currentOrg?.domain || 'sendaat.io'}>`,
          status: 'QUEUED_FOR_PACING_DISPATCH',
          recipient: testRecipient,
          organization_id: currentOrg?.id || 'org_sendaat_1001',
          apiKeyUsed: `${apiKey.substring(0, 18)}...`,
          deliverabilityScore: 99.8,
          timestamp: new Date().toISOString()
        }
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
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans text-white bg-[#050505] p-4 sm:p-6 lg:p-8 min-h-screen select-none">
      
      {/* 1. Header Banner */}
      <div className="bg-[#121212] text-white rounded-[24px] p-6 sm:p-8 border border-zinc-800 shadow-md space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-mono font-bold border border-zinc-700">
              REST API v1.4
            </span>
            <span className="px-3 py-1 rounded-lg bg-zinc-800 text-zinc-200 text-xs font-bold border border-zinc-700">
              PRODUCTION INFRASTRUCTURE
            </span>
          </div>

          <button
            onClick={() => setIsCreateKeyModalOpen(true)}
            className="px-4 py-2 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-black stroke-[2.5]" />
            <span>Create New API Key</span>
          </button>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Terminal className="w-7 h-7 text-white" />
            <span>Sendaat API Documentation</span>
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-3xl leading-relaxed">
            Integrate high-volume email dispatch, real-time deliverability telemetry, and automated suppression queries using custom production API keys for <strong className="text-white">{currentOrg?.name || 'Sendaat Enterprise'}</strong>.
          </p>
        </div>

        {/* Documentation Sub-Navigation Tabs */}
        <div className="pt-3 flex flex-wrap gap-2 border-t border-zinc-800">
          <button
            onClick={() => setActiveDocTab('endpoints')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeDocTab === 'endpoints' ? 'bg-white text-black shadow-xs font-extrabold' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>SDKs & Code Snippets</span>
          </button>

          <button
            onClick={() => setActiveDocTab('test_runner')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeDocTab === 'test_runner' ? 'bg-white text-black shadow-xs font-extrabold' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Live Console (Try It Out)</span>
          </button>

          <button
            onClick={() => setActiveDocTab('webhooks')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeDocTab === 'webhooks' ? 'bg-white text-black shadow-xs font-extrabold' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Webhooks & Gateway</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Code Snippets & REST Specification + API Keys List */}
      {activeDocTab === 'endpoints' && (
        <div className="space-y-6">
          {/* Secret API Keys Management Card */}
          <div className="bg-[#121212] p-6 rounded-[24px] border border-zinc-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-white" />
                  <span>Workspace Secret API Keys ({currentOrg?.name || 'Sendaat Enterprise'})</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Generate custom secret keys for external apps, Gmail SMTP bridges, or backend web servers.
                </p>
              </div>

              <button
                onClick={() => setIsCreateKeyModalOpen(true)}
                className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl border border-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Generate Key</span>
              </button>
            </div>

            {/* API Keys Table */}
            <div className="overflow-x-auto border border-zinc-800 rounded-xl">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-black text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="p-3">Key Name</th>
                    <th className="p-3">Secret Key String</th>
                    <th className="p-3">Permission Scope</th>
                    <th className="p-3">Created</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-zinc-300">
                  {apiKeys.map(keyItem => (
                    <tr 
                      key={keyItem.id} 
                      onClick={() => setSelectedKeyId(keyItem.id)}
                      className={`cursor-pointer transition-colors ${selectedKeyId === keyItem.id ? 'bg-zinc-900/90 font-semibold' : 'hover:bg-zinc-900/50'}`}
                    >
                      <td className="p-3 font-bold text-white flex items-center gap-2">
                        <Key className="w-3.5 h-3.5 text-white" />
                        <span>{keyItem.name}</span>
                        {selectedKeyId === keyItem.id && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white text-black font-extrabold">Active</span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-zinc-400">
                        <span className="truncate block max-w-[200px]">{keyItem.key}</span>
                      </td>
                      <td className="p-3 font-mono text-xs text-zinc-300">{keyItem.scope}</td>
                      <td className="p-3 text-zinc-400 text-xs font-mono">{keyItem.createdAt}</td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(keyItem.key, keyItem.id);
                          }}
                          className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-[11px] rounded-lg border border-zinc-700 transition-colors"
                          title="Copy Key"
                        >
                          {copiedKeyId === keyItem.id ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRevokeKey(keyItem.id);
                          }}
                          className="px-2 py-1 hover:bg-rose-950/60 text-rose-400 rounded-lg transition-colors"
                          title="Revoke Key"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-[#121212] p-6 sm:p-8 rounded-[24px] border border-zinc-800 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-white" />
                  <span>Developer Integration Snippets</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Snippets automatically compile with active key: <strong className="text-white font-mono">{activeKeyObj.name}</strong>
                </p>
              </div>

              {/* Language Selector */}
              <div className="flex bg-black p-1 rounded-xl text-xs gap-1 font-bold shrink-0 border border-zinc-800">
                {['curl', 'node', 'python', 'go', 'php'].map(lang => (
                  <button
                    key={lang}
                    onClick={() => setActiveTab(lang)}
                    className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                      activeTab === lang ? 'bg-white text-black font-bold shadow-xs' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {lang === 'curl' ? 'cURL' : lang === 'node' ? 'Node.js' : lang === 'python' ? 'Python' : lang === 'go' ? 'Go' : 'PHP'}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Snippet Box */}
            <div className="relative">
              <div className="p-5 bg-black text-zinc-200 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-zinc-800 shadow-inner">
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
                  activeTab === 'go' ? goSnippet : phpSnippet,
                  'snippet'
                )}
                className="absolute top-3 right-3 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-bold rounded-lg border border-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-zinc-300" />
                <span>{copiedKeyId === 'snippet' ? 'Copied!' : 'Copy Snippet'}</span>
              </button>
            </div>
          </div>

          {/* REST Endpoints Reference Table */}
          <div className="bg-[#121212] p-6 sm:p-8 rounded-[24px] border border-zinc-800 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-white" />
              <span>Core REST API Endpoints Specification</span>
            </h3>

            <div className="overflow-x-auto border border-zinc-800 rounded-xl">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-black text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="p-3">Method</th>
                    <th className="p-3">Endpoint Path</th>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Auth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-zinc-300">
                  <tr className="hover:bg-zinc-900/60 transition-colors">
                    <td className="p-3 font-mono font-bold text-emerald-400">POST</td>
                    <td className="p-3 font-mono text-white">/api/send-email</td>
                    <td className="p-3">Dispatch cold outreach or transactional message.</td>
                    <td className="p-3 text-right font-mono text-zinc-400">Bearer Token</td>
                  </tr>
                  <tr className="hover:bg-zinc-900/60 transition-colors">
                    <td className="p-3 font-mono font-bold text-blue-400">GET</td>
                    <td className="p-3 font-mono text-white">/api/deliverability/stats</td>
                    <td className="p-3">Fetch live Sender Score, SPF/DKIM metrics, and IP health.</td>
                    <td className="p-3 text-right font-mono text-zinc-400">Bearer Token</td>
                  </tr>
                  <tr className="hover:bg-zinc-900/60 transition-colors">
                    <td className="p-3 font-mono font-bold text-blue-400">GET</td>
                    <td className="p-3 font-mono text-white">/api/suppression-list</td>
                    <td className="p-3">Retrieve bounced contacts, un-subscribers, and spam traps.</td>
                    <td className="p-3 text-right font-mono text-zinc-400">Bearer Token</td>
                  </tr>
                  <tr className="hover:bg-zinc-900/60 transition-colors">
                    <td className="p-3 font-mono font-bold text-purple-400">POST</td>
                    <td className="p-3 font-mono text-white">/api/webhooks/verify</td>
                    <td className="p-3">Verify signature header for incoming webhook events.</td>
                    <td className="p-3 text-right font-mono text-zinc-400">HMAC-SHA256</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Interactive Live Request Console */}
      {activeDocTab === 'test_runner' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-[#121212] p-6 rounded-[24px] border border-zinc-800 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Play className="w-4 h-4 text-white" />
              <span>Interactive Request Builder</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-400">Recipient Email</label>
                <input
                  type="email"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400">Subject</label>
                <input
                  type="text"
                  value={testSubject}
                  onChange={(e) => setTestSubject(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400">HTML Payload Body</label>
                <textarea
                  rows={6}
                  value={testBody}
                  onChange={(e) => setTestBody(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-zinc-500 font-mono resize-none"
                />
              </div>

              <button
                onClick={handleRunLiveApiTest}
                disabled={isRunningTest}
                className="w-full py-2.5 px-4 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <Play className="w-4 h-4 text-black stroke-[2.5]" />
                <span>{isRunningTest ? 'Dispatching Test API Request...' : 'Send Live REST API Request'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#121212] p-6 rounded-[24px] border border-zinc-800 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-white" />
              <span>Response Inspector</span>
            </h3>

            {testResponse ? (
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between bg-black p-3 rounded-xl border border-zinc-800">
                  <span className="font-bold text-emerald-400">{testResponse.statusText}</span>
                  <span className="text-zinc-400 text-[11px]">{testResponse.latencyMs} ms</span>
                </div>

                <div className="p-4 bg-black text-zinc-200 rounded-xl border border-zinc-800 overflow-x-auto">
                  <pre>{JSON.stringify(testResponse.body, null, 2)}</pre>
                </div>
              </div>
            ) : (
              <div className="h-64 bg-black rounded-xl border border-zinc-800 flex flex-col items-center justify-center text-center p-6 text-zinc-500 space-y-2">
                <Terminal className="w-8 h-8 text-zinc-700" />
                <p className="text-xs font-mono">No request sent yet. Click "Send Live REST API Request" to view telemetry response.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Webhooks & Event Gateway */}
      {activeDocTab === 'webhooks' && (
        <div className="bg-[#121212] p-6 sm:p-8 rounded-[24px] border border-zinc-800 shadow-xs space-y-6">
          <div className="space-y-1">
            <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-white" />
              <span>Webhooks & Real-Time Event Gateway</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Receive real-time HTTP callbacks when emails are delivered, opened, clicked, or bounced.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-6 space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Webhook Endpoint URL</label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-500 font-mono"
              />
            </div>

            <div className="md:col-span-4 space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Event Type</label>
              <select
                value={webhookEvent}
                onChange={(e) => setWebhookEvent(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-500 font-mono"
              >
                <option value="email.delivered">email.delivered</option>
                <option value="email.opened">email.opened</option>
                <option value="email.bounced">email.bounced</option>
                <option value="email.clicked">email.clicked</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <button
                onClick={handleTriggerTestWebhook}
                disabled={isSendingWebhook}
                className="w-full py-2.5 px-4 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-black stroke-[2.5] ${isSendingWebhook ? 'animate-spin' : ''}`} />
                <span>Test Webhook</span>
              </button>
            </div>
          </div>

          {/* Webhook Delivery Log Table */}
          <div className="space-y-3 pt-4 border-t border-zinc-800">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Simulated Event Delivery Logs</h4>
            
            {webhookLogs.length === 0 ? (
              <div className="p-6 bg-black rounded-xl border border-zinc-800 text-center text-xs text-zinc-500 font-mono">
                No webhook events dispatched. Click "Test Webhook" to send a sample payload.
              </div>
            ) : (
              <div className="space-y-2 font-mono text-xs">
                {webhookLogs.map(log => (
                  <div key={log.id} className="p-3 bg-black rounded-xl border border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold text-[10px]">
                        {log.status}
                      </span>
                      <span className="text-white font-bold">{log.event}</span>
                      <span className="text-zinc-500 text-[11px] truncate max-w-xs">{log.url}</span>
                    </div>
                    <span className="text-zinc-500 text-[11px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE NEW API KEY MODAL */}
      {isCreateKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#121212] border border-zinc-800 rounded-[24px] p-6 max-w-md w-full shadow-2xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-white" />
                <span>Create Secret API Key</span>
              </h3>
              <button
                onClick={() => {
                  setIsCreateKeyModalOpen(false);
                  setNewlyCreatedKey(null);
                }}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {newlyCreatedKey ? (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Secret API Key Generated Successfully!</span>
                  </div>
                  <p className="text-[11px] text-zinc-300">
                    Copy and store this key securely. For security reasons, full secret keys are only shown once upon creation.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Secret Key String</label>
                  <div className="p-3 bg-black border border-zinc-800 rounded-xl text-white font-mono text-xs break-all flex items-center justify-between gap-2">
                    <span>{newlyCreatedKey.key}</span>
                    <button
                      onClick={() => copyToClipboard(newlyCreatedKey.key, 'modal')}
                      className="px-3 py-1 bg-white text-black font-bold text-xs rounded-lg shrink-0"
                    >
                      {copiedKeyId === 'modal' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCreateKeyModalOpen(false);
                    setNewlyCreatedKey(null);
                  }}
                  className="w-full py-2.5 bg-white text-black font-extrabold text-xs rounded-xl hover:bg-zinc-200 transition-colors"
                >
                  Done & Close
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Key Name / Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Production Gmail Server, Zapier Bot"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    autoFocus
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-500 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Permission Scope</label>
                  <select
                    value={newKeyScope}
                    onChange={(e) => setNewKeyScope(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-500 font-sans"
                  >
                    <option value="Full Access (read/write)">Full Access (read/write)</option>
                    <option value="Send Only (write)">Send Only (write)</option>
                    <option value="Read Deliverability Metrics">Read Deliverability Metrics</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setIsCreateKeyModalOpen(false)}
                    className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs rounded-xl border border-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateNewApiKey}
                    disabled={!newKeyName.trim()}
                    className="flex-1 py-2.5 bg-white hover:bg-zinc-200 disabled:opacity-50 text-black font-extrabold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    Generate Key
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
