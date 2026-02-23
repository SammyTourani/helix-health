'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Heart, Loader2, Plus, Sparkles, User, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { completeOnboarding } from '@/app/actions/profile';
import { BLOOD_TYPES, RECORD_TYPES, SPECIALTIES } from '@/types';

const steps = [
  { title: 'Your Profile', description: 'Basic health information', icon: User },
  { title: 'First Record', description: 'Add a condition or medication', icon: Heart },
  { title: 'Your Provider', description: 'Add your first doctor', icon: Users },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Form state
  const [dob, setDob] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [allergies, setAllergies] = useState('');
  const [recordTitle, setRecordTitle] = useState('');
  const [recordType, setRecordType] = useState('condition');
  const [recordDate, setRecordDate] = useState('');
  const [providerName, setProviderName] = useState('');
  const [providerSpecialty, setProviderSpecialty] = useState('');
  const [providerClinic, setProviderClinic] = useState('');

  function handleNext() {
    if (step < 2) setStep(step + 1);
  }

  function handleBack() {
    if (step > 0) setStep(step - 1);
  }

  function handleFinish() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set('date_of_birth', dob);
      formData.set('blood_type', bloodType);
      formData.set('allergies', allergies);
      if (recordTitle) {
        formData.set('first_record_title', recordTitle);
        formData.set('first_record_type', recordType);
        formData.set('first_record_date', recordDate || new Date().toISOString().split('T')[0]);
      }
      if (providerName) {
        formData.set('first_provider_name', providerName);
        formData.set('first_provider_specialty', providerSpecialty);
        formData.set('first_provider_clinic', providerClinic);
      }

      const result = await completeOnboarding(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    });
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">
            <span className="text-[#6366f1]">⚕</span> Helix
          </h1>
          <p className="text-muted-foreground mt-1">Let&apos;s set up your health profile</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                i < step ? 'bg-[#6366f1] text-white' :
                i === step ? 'bg-[#6366f1] text-white' :
                'bg-[#1e1e2e] text-muted-foreground'
              }`}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-12 h-0.5 ${i < step ? 'bg-[#6366f1]' : 'bg-[#1e1e2e]'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="bg-[#12121a] border-[#1e1e2e]">
              <CardContent className="pt-6 space-y-4">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#6366f1]/20 flex items-center justify-center mx-auto mb-3">
                    {(() => { const Icon = steps[step].icon; return <Icon className="h-6 w-6 text-[#6366f1]" />; })()}
                  </div>
                  <h2 className="text-xl font-semibold">{steps[step].title}</h2>
                  <p className="text-sm text-muted-foreground">{steps[step].description}</p>
                </div>

                {step === 0 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="bg-[#0a0a0f] border-[#1e1e2e]" />
                    </div>
                    <div className="space-y-2">
                      <Label>Blood Type</Label>
                      <Select value={bloodType} onValueChange={setBloodType}>
                        <SelectTrigger className="bg-[#0a0a0f] border-[#1e1e2e]">
                          <SelectValue placeholder="Select blood type" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#12121a] border-[#1e1e2e]">
                          {BLOOD_TYPES.map((bt) => (
                            <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Known Allergies (comma-separated)</Label>
                      <Input value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="Penicillin, Shellfish" className="bg-[#0a0a0f] border-[#1e1e2e]" />
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Record Type</Label>
                      <Select value={recordType} onValueChange={setRecordType}>
                        <SelectTrigger className="bg-[#0a0a0f] border-[#1e1e2e]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#12121a] border-[#1e1e2e]">
                          {RECORD_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input value={recordTitle} onChange={(e) => setRecordTitle(e.target.value)} placeholder="e.g., Type 2 Diabetes, Lisinopril 10mg" className="bg-[#0a0a0f] border-[#1e1e2e]" />
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input type="date" value={recordDate} onChange={(e) => setRecordDate(e.target.value)} className="bg-[#0a0a0f] border-[#1e1e2e]" />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">You can skip this step and add records later.</p>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Provider Name</Label>
                      <Input value={providerName} onChange={(e) => setProviderName(e.target.value)} placeholder="Dr. Jane Smith" className="bg-[#0a0a0f] border-[#1e1e2e]" />
                    </div>
                    <div className="space-y-2">
                      <Label>Specialty</Label>
                      <Select value={providerSpecialty} onValueChange={setProviderSpecialty}>
                        <SelectTrigger className="bg-[#0a0a0f] border-[#1e1e2e]">
                          <SelectValue placeholder="Select specialty" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#12121a] border-[#1e1e2e]">
                          {SPECIALTIES.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Clinic Name</Label>
                      <Input value={providerClinic} onChange={(e) => setProviderClinic(e.target.value)} placeholder="City Health Center" className="bg-[#0a0a0f] border-[#1e1e2e]" />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">You can skip this step and add providers later.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 0}
            className="border-[#1e1e2e]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          {step < 2 ? (
            <Button onClick={handleNext} className="bg-[#6366f1] hover:bg-[#4f46e5]">
              Next <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleFinish} disabled={isPending} className="bg-[#6366f1] hover:bg-[#4f46e5]">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Complete Setup
            </Button>
          )}
        </div>

        {/* Skip */}
        {step > 0 && step < 2 && (
          <p className="text-center mt-4">
            <button onClick={handleNext} className="text-sm text-muted-foreground hover:text-[#6366f1] transition-colors">
              Skip this step
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
