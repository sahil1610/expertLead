/// <reference types="Cypress" />
let urlMap = {};

function testing() {
    for (let prop in urlMap) {
        if (!urlMap[prop]['isBroken'] && urlMap[prop]['isToBeScrapped']) {
            cy.visit(prop).then(() => {
                cy.task('log', 'Visited URL -> ' + prop);
                urlMap[prop]['isToBeScrapped'] = false;
            });
            getAllLinks().then(function (count) {
                if (count > 0) {
                    testing();
                }
            });

        }

    }

    // if (count > Object.keys(urlMap).length) {
    //     testing();
    // } else {
    //     return 0;
    // }
}

function getAllLinks() {
    let count = 0;
    return cy.xpath('//a[starts-with(@href,"https://www.cypress") or starts-with(@href, "/")]')
        .each(($li) => {
            cy.wrap($li).should('have.attr', 'href').then((href) => {
                if (href.indexOf('www.cypress.io') === -1) {
                    href = "https://www.cypress.io" + href;
                }
                href = href.replace(/\/$/, "");
                if (href !== 'https://www.cypress.io' && !urlMap.hasOwnProperty(href)) {
                    count++;
                    let isBroken = false;
                    let isToBeScrapped = true;
                    cy.request({
                        "url": href,
                        "failOnStatusCode": false
                    }).then((resp) => {
                        if (resp.status >= 400) {
                            isBroken = true;
                            isToBeScrapped = false;
                        }
                        urlMap[href] = {"isBroken": isBroken, "isToBeScrapped": isToBeScrapped};
                    });

                }
            });
        }).then(function () {
            return count;
        });
};

context('Actions', () => {

    Cypress.on('uncaught:exception', (err, runnable) => {
        // returning false here prevents Cypress from
        // failing the test
        return false
    });

    // https://on.cypress.io/interacting-with-elements
    it('fetch all links from the home page', () => {
        cy.visit('/');
        getAllLinks();
    });

    it('iterate of all links of home page and so on', () => {
        testing();
    });

    it('iterate of all links of home page and so on', () => {
        for (let prop in urlMap) {
            cy.task('log', "KEY(): " + prop + "****IS BROKEN " + urlMap[prop]["isBroken"]);
            // if (urlMap.hasOwnProperty(prop)) {
            //     cy.log("IS BROKEN(): " + urlMap[prop]["isBroken"]);
            // }

        }
    });

    // it("test", function () {
    //    cy.log(json);
    // });
})
