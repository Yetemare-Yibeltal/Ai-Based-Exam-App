exports.featureQuestion = catchAsync(async (req, res) => {
  const question = await Question.findById(req.params.id);
  if (!question) return notFoundResponse(res, "Question not found");

  if (question.status !== "approved") {
    return errorResponse(res, "Only approved questions can be featured", 400);
  }

  question.tags = question.tags || [];
  const isFeatured = question.tags.includes("featured");

  if (isFeatured) {
    question.tags = question.tags.filter((t) => t !== "featured");
  } else {
    question.tags.push("featured");
  }

  await question.save({ validateBeforeSave: false });

  return successResponse(
    res,
    isFeatured
      ? "Question unfeatured successfully"
      : "Question featured successfully",
    { question: question.getFullQuestion() },
  );
});
