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

export const AddJobDialog = ({ open, onOpenChange, onAdd, defaultStage }) => {
  // 使用函数式初始化确保默认值只在初始时计算一次
  const getInitialFormData = () => ({
    companyName: '',
    position: '',
    deadline: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
    stage: defaultStage || 'submitted',
    progressStatus: 'normal',
    salary: '',
    location: '',
    channel: '官网',
    link: '',
    notes: '',
  });

  const [formData, setFormData] = useState(getInitialFormData);
  const [selectedMaterials, setSelectedMaterials] = useState(['简历PDF']);

  // 每次打开对话框时重置表单
  useEffect(() => {
    if (open) {
      setFormData({
        ...getInitialFormData(),
        stage: defaultStage || 'submitted',
      });
      setSelectedMaterials(['简历PDF']);
    }
  }, [open, defaultStage]);

  // 直接计算表单验证状态（不使用 useMemo 避免缓存问题）
  const validateForm = () => {
    const companyValid = typeof formData.companyName === 'string' && formData.companyName.trim().length > 0;
    const positionValid = typeof formData.position === 'string' && formData.position.trim().length > 0;
    
    // 更健壮的日期校验
    const deadlineStr = String(formData.deadline || '').trim();
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const deadlineValid = deadlineStr.length > 0 && dateRegex.test(deadlineStr);
    
    return {
      isValid: companyValid && positionValid && deadlineValid,
      companyValid,
      positionValid,
      deadlineValid,
      deadlineValue: deadlineStr,
    };
  };

  const validation = validateForm();

  const handleSubmit = () => {
    if (!validation.isValid) {
      console.log('表单校验失败:', { 
        company: formData.companyName, 
        position: formData.position, 
        deadline: formData.deadline,
        validation 
      });
      return;
    }

    const materials = selectedMaterials.map((name, index) => ({
      id: `m${Date.now()}_${index}`,
      name,
      completed: false,
    }));

    onAdd({
      ...formData,
      salary: parseInt(formData.salary) || 0,
      materials,
    });

    onOpenChange(false);
  };

  const toggleMaterial = (material) => {
    setSelectedMaterials(prev => 
      prev.includes(material)
        ? prev.filter(m => m !== material)
        : [...prev, material]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white">新增申请</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="dark:text-gray-200">公司名称 *</Label>
            <Input
              id="companyName"
              placeholder="如：字节跳动"
              value={formData.companyName}
              onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="position" className="dark:text-gray-200">岗位名称 *</Label>
            <Input
              id="position"
              placeholder="如：前端开发工程师"
              value={formData.position}
              onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="dark:text-gray-200">当前阶段</Label>
              <Select
                value={formData.stage}
                onValueChange={(value) => setFormData(prev => ({ ...prev, stage: value }))}
              >
                <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  {STAGE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className="dark:text-gray-200 dark:focus:bg-gray-700">{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline" className="dark:text-gray-200">截止日期 *</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="dark:text-gray-200">申请渠道</Label>
              <Select
                value={formData.channel}
                onValueChange={(value) => setFormData(prev => ({ ...prev, channel: value }))}
              >
                <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  {CHANNEL_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className="dark:text-gray-200 dark:focus:bg-gray-700">{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary" className="dark:text-gray-200">目标薪资（月薪）</Label>
              <Input
                id="salary"
                type="number"
                placeholder="25000"
                value={formData.salary}
                onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location" className="dark:text-gray-200">工作地点</Label>
            <Input
              id="location"
              placeholder="如：北京/远程"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="link" className="dark:text-gray-200">申请链接</Label>
            <Input
              id="link"
              placeholder="https://jobs.company.com/..."
              value={formData.link}
              onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="dark:text-gray-200">预设材料清单</Label>
            <div className="grid grid-cols-2 gap-2">
              {DEFAULT_MATERIALS.map((material) => (
                <label key={material} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700 dark:text-gray-200">
                  <Checkbox
                    checked={selectedMaterials.includes(material)}
                    onCheckedChange={() => toggleMaterial(material)}
                  />
                  <span className="text-sm">{material}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes" className="dark:text-gray-200">备注</Label>
            <Textarea
              id="notes"
              rows={2}
              placeholder="内推人、特殊要求等..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          
          <Button 
            onClick={handleSubmit} 
            className="w-full" 
            disabled={!validation.isValid}
          >
            添加申请
          </Button>
          
          {!validation.isValid && (
            <p className="text-xs text-muted-foreground text-center dark:text-gray-400">
              请填写公司名称、岗位名称和截止日期
              {formData.deadline && `（当前截止日期: ${formData.deadline}）`}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
