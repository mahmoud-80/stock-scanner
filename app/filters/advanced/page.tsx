// app/filters/advanced/page.tsx
'use client';
import { useState, useEffect } from 'react';

interface AdvancedFilter {
  id: string;
  name: string;
  conditions: FilterCondition[];
  isActive: boolean;
  createdAt: Date;
}

interface FilterCondition {
  field: string;
  operator: string;
  value: number | string;
}

const fieldOptions = [
  { value: 'price', label: 'السعر' },
  { value: 'changePercent', label: 'نسبة التغير' },
  { value: 'volume', label: 'حجم التداول' },
  { value: 'rsi', label: 'مؤشر RSI' },
  { value: 'macd', label: 'مؤشر MACD' },
  { value: 'sma_20', label: 'المتوسط المتحرك 20 يوم' }
];

const operatorOptions = [
  { value: 'greater', label: 'أكبر من' },
  { value: 'less', label: 'أقل من' },
  { value: 'equals', label: 'يساوي' }
];

export default function AdvancedFiltersPage() {
  const [filters, setFilters] = useState<AdvancedFilter[]>([]);
  const [newFilterName, setNewFilterName] = useState('');
  const [currentFilter, setCurrentFilter] = useState<AdvancedFilter | null>(null);
  const [currentLang, setCurrentLang] = useState('ar');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'ar';
    setCurrentLang(savedLang);
    
    // تحميل الفلاتر المحفوظة
    const savedFilters = localStorage.getItem('advancedFilters');
    if (savedFilters) {
      setFilters(JSON.parse(savedFilters));
    }
  }, []);

  const createNewFilter = () => {
    if (!newFilterName.trim()) return;

    const newFilter: AdvancedFilter = {
      id: `filter-${Date.now()}`,
      name: newFilterName,
      conditions: [],
      isActive: true,
      createdAt: new Date()
    };

    const updatedFilters = [...filters, newFilter];
    setFilters(updatedFilters);
    setCurrentFilter(newFilter);
    setNewFilterName('');
    localStorage.setItem('advancedFilters', JSON.stringify(updatedFilters));
  };

  const addCondition = () => {
    if (!currentFilter) return;

    const newCondition: FilterCondition = {
      field: 'price',
      operator: 'greater',
      value: 0
    };

    const updatedFilter = {
      ...currentFilter,
      conditions: [...currentFilter.conditions, newCondition]
    };

    setCurrentFilter(updatedFilter);
    updateFilter(updatedFilter);
  };

  const updateCondition = (index: number, field: string, value: any) => {
    if (!currentFilter) return;

    const updatedConditions = [...currentFilter.conditions];
    updatedConditions[index] = { ...updatedConditions[index], [field]: value };

    const updatedFilter = { ...currentFilter, conditions: updatedConditions };
    setCurrentFilter(updatedFilter);
    updateFilter(updatedFilter);
  };

  const removeCondition = (index: number) => {
    if (!currentFilter) return;

    const updatedConditions = currentFilter.conditions.filter((_, i) => i !== index);
    const updatedFilter = { ...currentFilter, conditions: updatedConditions };
    
    setCurrentFilter(updatedFilter);
    updateFilter(updatedFilter);
  };

  const updateFilter = (filter: AdvancedFilter) => {
    const updatedFilters = filters.map(f => f.id === filter.id ? filter : f);
    setFilters(updatedFilters);
    localStorage.setItem('advancedFilters', JSON.stringify(updatedFilters));
  };

  const deleteFilter = (filterId: string) => {
    const updatedFilters = filters.filter(f => f.id !== filterId);
    setFilters(updatedFilters);
    if (currentFilter?.id === filterId) {
      setCurrentFilter(null);
    }
    localStorage.setItem('advancedFilters', JSON.stringify(updatedFilters));
  };

  const applyFilter = (filter: AdvancedFilter) => {
    localStorage.setItem('selectedAdvancedFilter', JSON.stringify(filter));
    window.location.href = `/stocks?advancedFilter=${filter.id}`;
  };

  const isArabic = currentLang === 'ar';

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        {isArabic ? 'الفلاتر المتقدمة' : 'Advanced Filters'}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* لوحة إنشاء الفلتر */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">
            {isArabic ? 'إنشاء فلتر جديد' : 'Create New Filter'}
          </h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isArabic ? 'اسم الفلتر' : 'Filter Name'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newFilterName}
                onChange={(e) => setNewFilterName(e.target.value)}
                placeholder={isArabic ? 'أدخل اسم الفلتر' : 'Enter filter name'}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={createNewFilter}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                {isArabic ? 'إنشاء' : 'Create'}
              </button>
            </div>
          </div>

          {currentFilter && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-bold mb-3">
                {isArabic ? 'شروط الفلتر' : 'Filter Conditions'}
              </h3>
              
              {currentFilter.conditions.map((condition, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg mb-3">
                  <div className="grid grid-cols-12 gap-2 mb-2">
                    <div className="col-span-4">
                      <select
                        value={condition.field}
                        onChange={(e) => updateCondition(index, 'field', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        {fieldOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {isArabic ? option.label : option.value}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="col-span-3">
                      <select
                        value={condition.operator}
                        onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        {operatorOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {isArabic ? option.label : option.value}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="col-span-4">
                      <input
                        type="number"
                        value={condition.value as number}
                        onChange={(e) => updateCondition(index, 'value', parseFloat(e.target.value))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="القيمة"
                      />
                    </div>
                    
                    <div className="col-span-1">
                      <button
                        onClick={() => removeCondition(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addCondition}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
              >
                {isArabic ? '+ إضافة شرط' : '+ Add Condition'}
              </button>

              {currentFilter.conditions.length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => applyFilter(currentFilter)}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 w-full"
                  >
                    {isArabic ? 'تطبيق الفلتر على الأسهم' : 'Apply Filter to Stocks'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* قائمة الفلاتر المحفوظة */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">
            {isArabic ? 'الفلاتر المحفوظة' : 'Saved Filters'}
          </h2>
          
          {filters.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {isArabic ? 'لا توجد فلاتر محفوظة' : 'No saved filters'}
            </p>
          ) : (
            <div className="space-y-4">
              {filters.map(filter => (
                <div key={filter.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{filter.name}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentFilter(filter)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {isArabic ? 'تعديل' : 'Edit'}
                      </button>
                      <button
                        onClick={() => applyFilter(filter)}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        {isArabic ? 'تطبيق' : 'Apply'}
                      </button>
                      <button
                        onClick={() => deleteFilter(filter.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        {isArabic ? 'حذف' : 'Delete'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>{isArabic ? 'عدد الشروط:' : 'Conditions:'} {filter.conditions.length}</p>
                    <p>{isArabic ? 'أنشئ في:' : 'Created:'} {new Date(filter.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}