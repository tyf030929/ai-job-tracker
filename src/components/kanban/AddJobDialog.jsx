import React, { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { STAGE_OPTIONS, CHANNEL_OPTIONS, DEFAULT_MATERIALS } from '@/constants/jobStages';

const AddJobDialog = ({ open, onOpenChange, initialStage, onAdd, application }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    position: '',
    stage: 'submitted',
    deadline: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    channel: '官网',
    salary: '',
    location: '',
    link: '',
    notes: '',
    materials: DEFAULT_MATERIALS.map((name) => ({ id: `m${Date.now() + Math.random()}`, name, completed: false })),
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (application) {
      setFormData({
        companyName: application.companyName || '',
        position: application.position || '',
        stage: application.stage || 'submitted',
        deadline: application.deadline || format(addDays(new Date(), 7), 'yyyy-MM-dd'),
        channel: application.channel || '官网',
        salary: application.salary || '',
        location: application.location || '',
        link: application.link || '',
        notes: application.notes || '',
        materials: application.materials || DEFAULT_MATERIALS.map((name) => ({ id: `m${Date.now() + Math.random()}`, name, completed: false })),
      });
    } else if (initialStage) {
      setFormData((prev) => ({ ...prev, stage: initialStage }));
    }
  }, [application, initialStage]);

  const validate = () => {
    const newErrors = {};
    if (!formData.companyName.trim()) newErrors.companyName = '请输入公司名称';
    if (!formData.position.trim()) newErrors.position = '请输入岗位名称';
    if (!formData.deadline) newErrors.deadline = '请选择截止日期';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const jobData = {
      ...formData,
      salary: formData.salary ? parseInt(formData.salary) : 0,
      progressStatus: 'normal',
    };

    if (application) {
      onAdd({ ...jobData, id: application.id }, true);
    } else {
      onAdd(jobData);
    }

    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      companyName: '',
      position: '',
      stage: 'submitted',
      deadline: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
      channel: '官网',
      salary: '',
      location: '',
      link: '',
      notes: '',
      materials: DEFAULT_MATERIALS.map((name) => ({ id: `m${Date.now() + Math.random()}`, name, completed: false })),
    });
    setErrors({});
  };

  const handleMaterialToggle = (index) => {
    const newMaterials = [...formData.materials];
    newMaterials[index].completed = !newMaterials[index].completed;
    setFormData({ ...formData, materials: newMaterials });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{application ? '编辑申请' : '添加申请'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company & Position */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="companyName">公司名称 *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="如：字节跳动"
                className={errors.companyName ? 'border-red-500' : ''}
              />
              {errors.companyName && (
                <p className="text-xs text-red-500">{errors.companyName}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="position">岗位名称 *</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="如：前端开发工程师"
                className={errors.position ? 'border-red-500' : ''}
              />
              {errors.position && (
                <p className="text-xs text-red-500">{errors.position}</p>
              )}
            </div>
          </div>

          {/* Stage & Deadline */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>当前阶段</Label>
              <Select
                value={formData.stage}
                onValueChange={(value) => setFormData({ ...formData, stage: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="deadline">截止日期 *</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className={errors.deadline ? 'border-red-500' : ''}
              />
              {errors.deadline && (
                <p className="text-xs text-red-500">{errors.deadline}</p>
              )}
            </div>
          </div>

          {/* Channel & Salary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>申请渠道</Label>
              <Select
                value={formData.channel}
                onValueChange={(value) => setFormData({ ...formData, channel: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHANNEL_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="salary">目标薪资 (元/月)</Label>
              <Input
                id="salary"
                type="number"
                placeholder="如：25000"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              />
            </div>
          </div>

          {/* Location & Link */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="location">工作地点</Label>
              <Input
                id="location"
                placeholder="如：北京/上海/远程"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="link">申请链接</Label>
              <Input
                id="link"
                type="url"
                placeholder="https://..."
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label htmlFor="notes">备注</Label>
            <Textarea
              id="notes"
              rows={2}
              placeholder="记录一些注意事项..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {/* Materials checklist */}
          <div className="space-y-2">
            <Label>材料清单</Label>
            <div className="space-y-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              {formData.materials.map((mat, index) => (
                <label key={index} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={mat.completed}
                    onCheckedChange={() => handleMaterialToggle(index)}
                  />
                  <span className={`text-sm ${mat.completed ? 'line-through text-gray-400' : ''}`}>
                    {mat.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
            >
              取消
            </Button>
            <Button type="submit" className="flex-1">
              {application ? '保存' : '添加'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { AddJobDialog };