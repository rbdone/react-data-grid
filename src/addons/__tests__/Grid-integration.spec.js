'use strict';
import TestUtils from 'react/lib/ReactTestUtils';
import GridRunner from './GridRunner';



describe('Grid Integration', () => {
  describe('Grid Setup', () => {
    it("Creates the grid", () => {
      expect(new GridRunner({}).grid).toBeDefined();
    });

    it("Renders the grid", () => {
      TestUtils.isDOMComponent(new GridRunner({}).grid);
    })

    it("Renders 22 rows by default", () => {
      expect(TestUtils.scryRenderedDOMComponentsWithClass(new GridRunner({}).grid, 'react-grid-Row').length).toEqual(22);
    })
    
    it("Renders the grid in under 1500ms", () => {
      //this is obviously a bit of an arbitary number
      //not strictly a test, as (duh) it depends on what machine and js engine (aka browser) you use
      //but it works as a useful stop gap for anything that really kills perf.
      //as we make any perf improvements, we shoudl update this number to get it as low as we can
      //but dont think of this test as an form of performance benchmark, if this was a GCSE, I'd (hopefully) fail!
      var start=new Date();
      let grid = new GridRunner({renderIntoBody:true});
      TestUtils.isDOMComponent(grid.grid);
      expect(new Date() - start).not.toBeGreaterThan(1500);
      grid.dispose();
    })

  });
  describe('Grid Drag', () => {
    it("Shows drag selector", () => {
      new GridRunner({})
      .drag({from:0,to:4,col:3,
      beforeEnd: function() {
        //check we have the right classes
        expect(TestUtils.scryRenderedDOMComponentsWithClass(component,'is-dragged-over-down').length).toEqual(1);
        expect(TestUtils.scryRenderedDOMComponentsWithClass(component,'was-dragged-over').length).toEqual(2);
      }})
    });
    it("Drags a column", () => {
      new GridRunner({})
      .drag({from:0,to:4,col:3})
      .hasDragged({from:0,to:4,col:3,cellKey:'title'})
    });
  });
  describe('Grid Selection', () => {
    it("Selects on click", () => {
      new GridRunner({})
      .selectCell({cellIdx:3,rowIdx:3})
      .hasSelected({cellIdx:3,rowIdx:3})
      .dispose();
    });
  });
  describe('Editors', () => {
    it("Readonly columns are NOT Editable", () => {
      new GridRunner({})
      .clickIntoEditor({cellIdx:0,rowIdx:3})
      .isNotEditable();
    });
    it("Enter commits an edit", () => {
      new GridRunner({})
        .changeCell({
          select: {row:3, cell:5},
          val:'Test',
          ev:{key:'Enter'},
          expectToSelect: {row:3,cell:5}
        })

    });


    it("Start editing by pressing a key", () => {
      let grid=new GridRunner({});
      grid.selectCell({rowIdx:3, cellIdx:5})
        .keyDown({
          keyCode:69 //letter 'e'
        }, grid.cell )
        .isEditable()
        .keyDown({key:'Enter'})
        .hasCommitted('E') //keydown ALWAYS upper case http://stackoverflow.com/questions/2263889/why-always-uppercase-in-my-code
        .isNotEditable()
        .dispose();

    });
    it("Start editing by pressing enter", () => {
      let grid=new GridRunner({});
        grid.selectCell({rowIdx:3, cellIdx:5})
        .keyDown({key:'Enter'}, grid.cell)
        .isEditable()
        .dispose();

    });
   it("Can tab out of an Editor", () => {
      new GridRunner({})
      .changeCell({
        select: {row:3, cell:5},
        val:'Test',
        ev:{key:'Tab'},
        expectToSelect: {row:3,cell:6}
      })
    });
    it("Can shift+tab out of an Editor", () => {
      new GridRunner({})
      .changeCell({
        select: {row:3, cell:5},
        val:'Test',
        ev:{key:'Tab',shiftKey:true},
        expectToSelect: {row:3,cell:4}
      })
    });
    it("Arrow Left doesnt commit your change if you are not at the start of the text", () => {
      new GridRunner({renderIntoBody: true})
        .clickIntoEditor({rowIdx:3, cellIdx:5})
        .setValue('Test')
        .setCursor(2)
        .keyDown({key:'ArrowLeft'})
        .isEditable()
        .dispose();
    });

    it("Arrow Left does commit your change if you are at the start of the text", () => {
      new GridRunner({})
      //by default we are at pos 0 with a blank value
      .changeCell({
        select: {row:3, cell:5},
        val:'',
        ev:{key:'ArrowLeft'},
        expectToSelect: {row:3,cell:4}
      })
    });
    it("Arrow Right commits your change when you are at the end of the text", () => {
      new GridRunner({renderIntoBody: true})
        .clickIntoEditor({rowIdx:3, cellIdx:5})
        .setValue('Test')
        .setCursor(4)
        .keyDown({key:'ArrowRight'})
        .hasCommitted('Test')
        .hasSelected({rowIdx:3,cellIdx:6})
        .dispose();
    });

    it("Arrow Right doesnt commit your change when you are at the end of the text", () => {
      new GridRunner({renderIntoBody: true})
        .clickIntoEditor({rowIdx:3, cellIdx:5})
        .setValue('Test')
        .setCursor(2)
        .keyDown({key:'ArrowRight'})
        .isEditable()
        .dispose();
    });
    it("Arrow Up commits your change", () => {
      new GridRunner({})
        .changeCell({
        select: {row:3, cell:5},
        val:'Test',
        ev:{key:'ArrowUp'},
        expectToSelect: {row:2,cell:5}
      })
    });
    it("Arrow Down commits your change", () => {
      new GridRunner({})
        .changeCell({
        select: {row:3, cell:5},
        val:'Test',
        ev:{key:'ArrowDown'},
        expectToSelect: {row:4,cell:5}
      })
    });
  });
});
