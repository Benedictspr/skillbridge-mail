import React, { useState } from 'react';
import { Key, Code, ShieldCheck, Copy, Check, Terminal, Zap, Globe, Layers } from 'lucide-react';

export default function SkillBridgeApiView({ currentOrg }) {
  const [copiedKey, setCopiedKey] = useState(false);
  const [activeTab, setActiveTab] = useState('curl'); // 'curl' | 'node' | 'python'

  const apiKey = `sk_live_sb_${currentOrg.id.replace('org_', '')}_99a4x28190c`;

  const curlSnippet = `curl -X POST https://api.skillbridge.io/v1/email/send \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "organization_id": "${currentOrg.id}",
    "to": "student@university.edu",
    "template_id": "option-1-best",
    "params": {
      "first_name": "Alex",
      "company": "SkillBridge Network"
    }
  }'`;

  const nodeSnippet = `import { SkillBridge } from '@skillbridge/sdk';

const client = new SkillBridge({
  apiKey: '${apiKey}',
  organizationId: '${currentOrg.id}'
});

const result = await client.email.send({
  to: 'student@university.edu',
  templateId: 'option-1-best',
  params: { first_name: 'Alex' }
});`;

  const pythonSnippet = `from skillbridge import SkillBridgeClient

client = SkillBridgeClient(
    api_key="${apiKey}",
    organization_id="${currentOrg.id}"
)

response = client.email.send(
    to="student@university.edu",
    template_id="option-1-best",
    params={"first_name": "Alex"}
)`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-mono font-bold">
            DEVELOPER PLATFORM
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
            REST v1.4
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <Terminal className="w-8 h-8 text-blue-400" />
          SkillBridge API & Webhook Gateway
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl">
          Integrate email outreach, deliverability checks, and suppression queries directly into your applications with multi-tenant developer keys for {currentOrg.name}.
        </p>
      </div>

      {/* API Key Box */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
          <Key className="w-5 h-5 text-blue-600" />
          <span>Organization Secret Key ({currentOrg.name})</span>
        </h3>
        
        <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between font-mono text-xs">
          <span>{apiKey}</span>
          <button
            onClick={() => copyToClipboard(apiKey)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-sans font-bold text-xs rounded-xl flex items-center gap-1.5"
          >
            {copiedKey ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copiedKey ? 'Copied' : 'Copy API Key'}</span>
          </button>
        </div>
      </div>

      {/* Code Snippets */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Code className="w-5 h-5 text-indigo-600" />
            <span>Developer Integration Snippets</span>
          </h3>

          <div className="flex bg-slate-100 p-1 rounded-xl text-xs gap-1 font-bold">
            <button
              onClick={() => setActiveTab('curl')}
              className={`px-3 py-1.5 rounded-lg ${activeTab === 'curl' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'}`}
            >
              cURL
            </button>
            <button
              onClick={() => setActiveTab('node')}
              className={`px-3 py-1.5 rounded-lg ${activeTab === 'node' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'}`}
            >
              Node.js
            </button>
            <button
              onClick={() => setActiveTab('python')}
              className={`px-3 py-1.5 rounded-lg ${activeTab === 'python' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'}`}
            >
              Python
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-950 text-emerald-400 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed">
          <pre>{activeTab === 'curl' ? curlSnippet : activeTab === 'node' ? nodeSnippet : pythonSnippet}</pre>
        </div>
      </div>
    </div>
  );
}
