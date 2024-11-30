exports.main = async (dymo) => {
    await dymo.sendEmail({
        from: "test@test.com",
        to: "jyQd0@example.com",
        subject: "Test",
        html: "<div class=\"flex items-center justify-center bg-gray-100\">Test</div>",
        options: {
            composeTailwindClasses: true,
            waitToResponse: false
        }
    });
};