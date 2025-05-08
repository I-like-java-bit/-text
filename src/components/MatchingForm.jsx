import React, { useState, useEffect } from "react";

// 使用相对路径
const API_URL = ""; // 空字符串表示使用相对路径

const MatchingForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    introduction: "",
    grade: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });
  const [activeField, setActiveField] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [hasWithdrawn, setHasWithdrawn] = useState(false);

  const grades = ["大一", "大二", "大三", "大四"];

  // 页面加载时检查提交和撤回状态
  useEffect(() => {
    const submissionStatus = localStorage.getItem("formSubmitted");
    const withdrawalStatus = localStorage.getItem("formWithdrawn");

    if (submissionStatus) {
      try {
        const { submitted, data } = JSON.parse(submissionStatus);
        if (submitted) {
          setHasSubmitted(true);
          setFormData(data);
          setMessage({
            type: "success",
            content: "您已成功提交申请，请勿重复提交",
          });
        }
      } catch (error) {
        console.error("Error parsing submission status:", error);
        localStorage.removeItem("formSubmitted");
      }
    }

    if (withdrawalStatus) {
      setHasWithdrawn(true);
    }
  }, []);

  const handleChange = (e) => {
    if (hasSubmitted) return;
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFocus = (fieldName) => {
    if (hasSubmitted) return;
    setActiveField(fieldName);
  };

  const handleBlur = () => {
    setActiveField("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (hasSubmitted) {
      setMessage({
        type: "error",
        content: "您已提交过申请，不能重复提交",
      });
      return;
    }

    setIsLoading(true);
    setMessage({ type: "", content: "" });

    try {
      const submitUrl = `${API_URL}/api/applications`;
      console.log("正在提交到:", submitUrl);

      const response = await fetch(submitUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors",
        credentials: "omit",
        body: JSON.stringify({
          name: formData.name,
          grade: formData.grade,
          introduction: formData.introduction,
        }),
      });

      console.log("服务器响应状态:", response.status);

      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.text();
          console.error("错误响应:", errorData);
          errorMessage = errorData;
        } catch (e) {
          console.error("解析错误响应失败:", e);
          errorMessage = "提交失败，请稍后重试";
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("服务器响应数据:", data);

      localStorage.setItem(
        "formSubmitted",
        JSON.stringify({
          submitted: true,
          data: formData,
          timestamp: new Date().toISOString(),
        })
      );

      setHasSubmitted(true);
      setMessage({
        type: "success",
        content: data.message || "报名成功！我们会尽快处理您的申请",
      });
    } catch (error) {
      console.error("提交错误:", error);
      setMessage({
        type: "error",
        content: error.message || "网络错误，请稍后重试",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 处理撤回操作
  const handleWithdraw = async () => {
    if (hasWithdrawn) {
      setMessage({
        type: "error",
        content: "您已经使用过撤回机会，不能再次撤回",
      });
      return;
    }

    setIsLoading(true);
    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 记录撤回状态
      localStorage.setItem("formWithdrawn", "true");
      // 清除提交状态
      localStorage.removeItem("formSubmitted");

      setHasWithdrawn(true);
      setHasSubmitted(false);
      setMessage({
        type: "success",
        content: "申请已撤回，您可以修改信息后重新提交（仅有一次撤回机会）",
      });
    } catch (error) {
      setMessage({
        type: "error",
        content: "撤回失败，请稍后重试",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 清除提交记录（用于测试）
  const handleReset = () => {
    localStorage.removeItem("formSubmitted");
    localStorage.removeItem("formWithdrawn");
    setHasSubmitted(false);
    setHasWithdrawn(false);
    setFormData({
      name: "",
      introduction: "",
      grade: "",
    });
    setMessage({ type: "", content: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-grid-primary-700/[0.02] -z-1"></div>

      <div className="container mx-auto px-4 py-8 sm:py-16 relative">
        <div className="max-w-2xl mx-auto">
          {/* 卡片容器 */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl sm:hover:shadow-3xl border border-primary-100">
            {/* 头部装饰 */}
            <div className="h-1.5 sm:h-2 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600"></div>

            {/* 内容区域 */}
            <div className="px-4 sm:px-8 py-6 sm:py-10">
              {/* 头部 */}
              <div className="text-center mb-8 sm:mb-12">
                <div className="inline-block p-2 bg-primary-50 rounded-xl sm:rounded-2xl mb-3 sm:mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 sm:h-8 sm:w-8 text-primary-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                  在线报名
                </h2>
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="w-16 sm:w-24 h-1 sm:h-1.5 bg-gradient-to-r from-primary-300 to-primary-600 rounded-full"></div>
                </div>
                <p className="text-gray-600 text-base sm:text-lg max-w-md mx-auto">
                  请填写您的个人信息，完成在线报名申请
                  {hasSubmitted && (
                    <span className="block text-primary-600 mt-2 text-sm">
                      （您已提交申请，
                      {hasWithdrawn ? "已使用撤回机会" : "可撤回一次"}）
                    </span>
                  )}
                </p>

                {/* 添加重置按钮（仅用于测试） */}
                <button
                  onClick={handleReset}
                  className="mt-4 text-sm text-gray-500 hover:text-gray-700"
                >
                  重置（测试用）
                </button>
              </div>

              {/* 消息提示 */}
              {message.content && (
                <div
                  className={`mb-6 sm:mb-8 rounded-lg sm:rounded-xl p-3 sm:p-4 border ${
                    message.type === "success"
                      ? "bg-green-50/80 border-green-200 text-green-700"
                      : "bg-red-50/80 border-red-200 text-red-700"
                  } backdrop-blur-sm transform transition-all duration-300 ease-in-out animate-fade-in`}
                >
                  <p className="text-sm font-medium">{message.content}</p>
                  {hasSubmitted && !hasWithdrawn && (
                    <p className="text-xs mt-2 text-gray-500">
                      提交时间：
                      {new Date(
                        JSON.parse(
                          localStorage.getItem("formSubmitted")
                        ).timestamp
                      ).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* 表单 */}
              <form className="space-y-6 sm:space-y-8" onSubmit={handleSubmit}>
                {/* 姓名输入 */}
                <div className="space-y-1.5 sm:space-y-2">
                  <label
                    htmlFor="name"
                    className={`block text-sm font-medium transition-colors duration-200 ${
                      activeField === "name"
                        ? "text-primary-600"
                        : "text-gray-700"
                    }`}
                  >
                    姓名
                  </label>
                  <div className="relative">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => handleFocus("name")}
                      onBlur={handleBlur}
                      disabled={hasSubmitted}
                      className={`block w-full px-3 sm:px-4 py-3 sm:py-3.5 rounded-lg sm:rounded-xl border shadow-sm transition-all duration-200 text-base
                        ${
                          activeField === "name"
                            ? "border-primary-400 ring-2 ring-primary-100 bg-white"
                            : hasSubmitted
                            ? "border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                            : "border-gray-300 hover:border-gray-400 bg-white/60"
                        }
                        focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400`}
                      placeholder="请输入您的姓名"
                    />
                  </div>
                </div>

                {/* 年级选择 */}
                <div className="space-y-1.5 sm:space-y-2">
                  <label
                    htmlFor="grade"
                    className={`block text-sm font-medium transition-colors duration-200 ${
                      activeField === "grade"
                        ? "text-primary-600"
                        : "text-gray-700"
                    }`}
                  >
                    年级
                  </label>
                  <div className="relative">
                    <select
                      id="grade"
                      name="grade"
                      required
                      value={formData.grade}
                      onChange={handleChange}
                      onFocus={() => handleFocus("grade")}
                      onBlur={handleBlur}
                      disabled={hasSubmitted}
                      className={`block w-full px-3 sm:px-4 py-3 sm:py-3.5 rounded-lg sm:rounded-xl border shadow-sm transition-all duration-200 text-base appearance-none
                        ${
                          activeField === "grade"
                            ? "border-primary-400 ring-2 ring-primary-100 bg-white"
                            : hasSubmitted
                            ? "border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                            : "border-gray-300 hover:border-gray-400 bg-white/60"
                        }
                        focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400`}
                    >
                      <option value="">请选择年级</option>
                      {grades.map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 sm:px-4 text-gray-400">
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 自我介绍 */}
                <div className="space-y-1.5 sm:space-y-2">
                  <label
                    htmlFor="introduction"
                    className={`block text-sm font-medium transition-colors duration-200 ${
                      activeField === "introduction"
                        ? "text-primary-600"
                        : "text-gray-700"
                    }`}
                  >
                    自我介绍
                  </label>
                  <div className="relative">
                    <textarea
                      id="introduction"
                      name="introduction"
                      rows="4"
                      required
                      value={formData.introduction}
                      onChange={handleChange}
                      onFocus={() => handleFocus("introduction")}
                      onBlur={handleBlur}
                      disabled={hasSubmitted}
                      className={`block w-full px-3 sm:px-4 py-3 sm:py-3.5 rounded-lg sm:rounded-xl border shadow-sm transition-all duration-200 text-base
                        ${
                          activeField === "introduction"
                            ? "border-primary-400 ring-2 ring-primary-100 bg-white"
                            : hasSubmitted
                            ? "border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                            : "border-gray-300 hover:border-gray-400 bg-white/60"
                        }
                        focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 resize-none`}
                      placeholder="自我介绍一下吧，说说专业、性格、熟悉的技能、想提升的技术..."
                    />
                  </div>
                </div>

                {/* 提交按钮区域 */}
                <div className="pt-4 sm:pt-6">
                  {hasSubmitted ? (
                    <div className="text-center space-y-4">
                      <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200">
                        <p className="text-gray-600">您的申请已提交成功</p>
                        {!hasWithdrawn && (
                          <div className="mt-3 sm:mt-4">
                            <button
                              type="button"
                              onClick={handleWithdraw}
                              disabled={isLoading}
                              className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
                            >
                              撤回申请并修改
                            </button>
                            <p className="text-xs text-gray-500 mt-1">
                              注意：仅有一次撤回机会
                            </p>
                          </div>
                        )}
                        {hasWithdrawn && (
                          <p className="text-xs text-gray-500 mt-1">
                            您已使用过撤回机会，如需修改请联系管理员
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={isLoading || hasSubmitted}
                      className={`w-full py-3.5 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl text-white font-medium text-base sm:text-lg transition-all duration-300 transform hover:scale-[1.02] 
                        ${
                          isLoading || hasSubmitted
                            ? "bg-primary-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl active:scale-[0.98]"
                        }`}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          处理中...
                        </span>
                      ) : (
                        "提交申请"
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* 底部装饰 */}
          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-sm text-gray-500">
              © 2025 在线报名系统
              <span className="mx-2">·</span>
              <span className="text-primary-600">便捷、高效、专业</span>
            </p>
            <div className="mt-3 sm:mt-4">
              <a
                href="https://yz.cpolar.top"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                查看匹配状态
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchingForm;
