'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuditInput, AuditTool, UseCase } from '@/types/audit';
import { runAudit } from '@/lib/audit-engine';
import ToolSelector from './ToolSelector';
import TeamSizeInput from './TeamSizeInput';
import UseCaseSelector from './UseCaseSelector';
import SavingsGauge from './SavingsGauge';

const STEPS = ['Add Tools', 'Team Info', 'Run Audit'];

export default function AuditWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [tools, setTools] = useState<AuditTool[]>([]);
  const [teamSize, setTeamSize] = useState(1);
  const [useCase, setUseCase] = useState<UseCase>('Mixed');
  const [isRunning, setIsRunning] = useState(false);

  const handleRunAudit = useCallback(async () => {
    setIsRunning(true);
    const input: AuditInput = { tools, teamSize, useCase };
    await new Promise((r) => setTimeout(r, 900));
    const result = runAudit(input);
    localStorage.setItem('auditResult', JSON.stringify(result));
    router.push('/results');
  }, [tools, teamSize, useCase, router]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
      {/* Main */}
      <div>
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 ${i <= step ? 'text-charcoal' : 'text-muted-light'}`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                  ${i < step ? 'bg-emerald border-emerald text-white' : i === step ? 'bg-charcoal border-charcoal text-white' : 'bg-white border-gray-200 text-muted-light'}`}>
                  {i < step ? '✓' : i + 1}
                </span>
                <span className="text-sm font-medium hidden sm:block">{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-8 sm:w-16 transition-all ${i < step ? 'bg-emerald' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 0: Tools */}
        {step === 0 && (
          <div>
            <ToolSelector tools={tools} onChange={setTools} />
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setStep(1)}
                disabled={tools.length === 0}
                className="bg-charcoal text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-charcoal/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Continue to Team Info →
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Team */}
        {step === 1 && (
          <div>
            <TeamSizeInput value={teamSize} onChange={setTeamSize} />
            <div className="mt-6">
              <UseCaseSelector value={useCase} onChange={setUseCase} />
            </div>
            <div className="mt-6 flex justify-between">
              <button onClick={() => setStep(0)} className="border border-gray-200 text-charcoal px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">
                ← Back
              </button>
              <button
                onClick={() => setStep(2)}
                className="bg-charcoal text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-charcoal/90 transition-all"
              >
                Review Audit →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Confirm */}
        {step === 2 && (
          <div>
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-6">
              <h3 className="font-bold text-charcoal mb-4">Audit Summary</h3>
              <div className="space-y-2">
                {tools.map((t) => (
                  <div key={t.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <span className="font-semibold text-sm text-charcoal">{t.tool}</span>
                      <span className="text-muted text-xs ml-2">{t.plan}</span>
                    </div>
                    <span className="text-sm font-bold text-coral">${t.monthlySpend}/mo</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
                <span className="text-muted">Team size</span>
                <span className="font-semibold">{teamSize} {teamSize === 1 ? 'person' : 'people'}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted">Primary use case</span>
                <span className="font-semibold">{useCase}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted">Total current spend</span>
                <span className="font-bold text-coral">${tools.reduce((s, t) => s + t.monthlySpend, 0)}/mo</span>
              </div>
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="border border-gray-200 text-charcoal px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">
                ← Back
              </button>
              <button
                onClick={handleRunAudit}
                disabled={isRunning}
                className="bg-emerald text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-emerald-600 disabled:opacity-70 transition-all flex items-center gap-2 shadow-lg shadow-emerald/20"
              >
                {isRunning ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>◎ Run Free Audit</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar gauge */}
      <div className="lg:sticky lg:top-24">
        <SavingsGauge tools={tools} teamSize={teamSize} />
      </div>
    </div>
  );
}
