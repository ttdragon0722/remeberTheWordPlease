if (localStorage.getItem("update")) {
    localStorage.setItem("update", true);
} else {
    localStorage.removeItem("number");
    localStorage.removeItem("mode");
    localStorage.removeItem("indexSet"); localStorage.setItem("update", true);
}

class WordProcessor {
    static data;
    static idx;
    constructor(output, hint, next_btn, prev_btn, hint_btn, finish_load) {
        this.output = $(output);
        this.ans = $(hint);
        this.hint_btn = $(hint_btn);
        this.next_btn = $(next_btn);
        this.prev_btn = $(prev_btn);
        // number
        console.log(localStorage.getItem("number"));

        if (localStorage.getItem("number")) {

            if (isNaN(parseInt(localStorage.getItem("number")))) {
                WordProcessor.idx = 0;
            } else {
                WordProcessor.idx = parseInt(localStorage.getItem("number"));
            }
        } else {
            localStorage.setItem("number", 0);
            WordProcessor.idx = 0;
        }
        // data
        if (localStorage.getItem("data")) {
        }
        let self = this;
        WordProcessor.get_data(function (df) {
            console.log(WordProcessor.data[WordProcessor.idx]);
            self.output.html(WordProcessor.data[WordProcessor.idx]["vocabulary"])
            self.ans.children(".type").html(WordProcessor.data[WordProcessor.idx]["partOfSpeech"]);
            self.ans.children(".answer").html(WordProcessor.data[WordProcessor.idx]["chinese"]);

            for (var i = 0; i < WordProcessor.data.length; i++) {
                $(".list").append(
                    `<tr class="val"><td class="idx" >${i}</td><td>${WordProcessor.data[i]["vocabulary"]}</td><td>${WordProcessor.data[i]["partOfSpeech"]}</td><td class="chinese">${WordProcessor.data[i]["chinese"]}</td></tr>`
                )
            }
            finish_load();
        });
    }

    static get_data(func) {
        $.ajax({
            type: "GET",
            url: "../../src/vocabulary.json",
            data: "json",
            dataType: "json",
            success: function (response) {
                console.log(response);
                WordProcessor.data = response["vocabularies"];
                func();
            }
        });
    }

    static random_idx(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }
    random() {
        WordProcessor.idx = WordProcessor.random_idx(Setting.min, Setting.max);
        localStorage.setItem("number",WordProcessor.idx );
        this.display();
    }

    sound() {
        const utterance = new SpeechSynthesisUtterance(this.output.html());
        speechSynthesis.speak(utterance);
    }

    display() {
        this.close_hint();
        this.output.html(WordProcessor.data[WordProcessor.idx]["vocabulary"])
        this.ans.children(".type").html(WordProcessor.data[WordProcessor.idx]["partOfSpeech"]);
        this.ans.children(".answer").html(WordProcessor.data[WordProcessor.idx]["chinese"]);
        return WordProcessor.idx
    }

    set(idx) {
        WordProcessor.idx = idx;
        localStorage.setItem("number", WordProcessor.idx);
        this.display();
    }

    next() {
        if (WordProcessor.idx < Setting.max) {
            WordProcessor.idx++;
        } else {
            WordProcessor.idx = 0;
        }

        localStorage.setItem("number",WordProcessor.idx );
        this.display();
    }

    prev() {
        if (WordProcessor.idx > Setting.min) {
            WordProcessor.idx--;
        } else {
            WordProcessor.idx = Setting.max;
        }
        localStorage.setItem("number", WordProcessor.idx);
        this.display();
    }

    hint() {
        if (this.ans.is(":hidden")) {
            this.ans.show();
        } else {
            this.ans.hide();
        }
    }
    close_hint() {
        this.ans.hide();
    }
}

class Menu {
    constructor(menu_btn, panel) {
        this.menu_btn = $(menu_btn);
        this.panel = $(panel);
        this.panel.hide();
    }

    click() {
        const self = this;
        if (this.panel.is(":hidden")) {
            this.panel.show();
            gsap.fromTo(
                this.panel, {
                y: "-100%"
            },
                {
                    y: 0,
                    ease: "Power",
                    duration: 0.5
                }
            );
        } else {
            gsap.to(this.panel, {
                opacity: 0,
                duration: 0.2,
                onComplete: function () {
                    self.panel.hide();
                    gsap.set(self.panel, { opacity: 1 })
                }
            }
            );
        }
    }

}

class Setting {
    static min = 0;
    static max = 0;
    static mode = 2;
    static data = {};
    constructor() {
        if (localStorage.getItem("indexSet")) {
            Setting.data = JSON.parse(localStorage.getItem("indexSet"));
        } else {
            Setting.data = {
                "min": Setting.min,
                "max": WordProcessor.data.length - 1
            }
            localStorage.setItem("indexSet", JSON.stringify(Setting.data));
        }
        Setting.min = Setting.data["min"];
        Setting.max = Setting.data["max"];
        $(".amount-set").attr("min", Setting.min);
        $(".amount-set").attr("max", Setting.max);
        $("#val-min").val(Setting.min);
        $("#val-max").val(Setting.max);

        if (localStorage.getItem("mode")) {
            $(`#mode-${localStorage.getItem("mode")}`).click();
            Setting.mode = localStorage.getItem("mode");
        } else {
            localStorage.setItem("mode", Setting.mode);

            console.log(localStorage.getItem("mode"));
            $("#mode-2").click();
        }
    }

    set(b, amount) {
        amount = parseInt(amount);
        if (WordProcessor.data.length > amount && amount >= 0) {
            if (b == "min") {
                Setting.min = amount;
            } else {
                Setting.max = amount;
            }
        } else {
            if (b == "min") {
                Setting.min = 0;
                $("#val-min").val(0);
            } else {
                Setting.max = WordProcessor.data.length - 1;
                $("#val-max").val(Setting.max);
            }
        }
        Setting.data = {
            "min": Setting.min,
            "max": Setting.max
        }
        localStorage.setItem("indexSet", JSON.stringify(Setting.data));
    }

    setMode(val) {
        Setting.mode = val;
        console.log(Setting.mode);
        localStorage.setItem("mode", Setting.mode);
    }
}

let SETTING;
function val_click() {
    $(".val").on("click", function () {
        console.log("c");
        wp.set(parseInt($(this).children(".idx").html()));
        menu.click();
    })
    SETTING = new Setting();

    $("input[name='mode']").click(function () {
        SETTING.setMode(parseInt($("input[name='mode']:checked").val()));
    });
}

wp = new WordProcessor("#question", "#hint", "#next", "#prev", "#answerBtn", val_click);

wp.output.on("click", function () {
    wp.sound();
});

wp.hint_btn.on("click", function () {
    wp.hint();
})

wp.next_btn.on("click", function () {
    console.log(Setting.mode);
    if (Setting.mode == 2) {
        wp.next();
    } else {
        console.log("click");
        wp.random();
    }
})

wp.prev_btn.on("click", function () {
    if (Setting.mode == 2) {
        wp.prev();
    } else {
        wp.random();
    }
})

menu = new Menu("#menu", ".setting")

menu.menu_btn.on("click", function () {
    menu.click();
})

$('#chinese-display').change(function () {
    if ($(this).is(':checked')) {
        // checkbox 已勾選
        $(".chinese").show();
    } else {
        // checkbox 未勾選
        $(".chinese").hide()
    }
});

$('#val-min').change(function () {
    SETTING.set("min", $("#val-min").val());
});

$('#val-max').change(function () {
    SETTING.set("max", $("#val-max").val());
});

