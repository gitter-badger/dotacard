var skills = {
  wk: {
    stun: {
      cast: function(skill, source, target){           
        var wk = source;
        var stun = skill.data('stunduration');
        var dot = skill.data('dotduration');
        if(game.status == 'turn') states.table.animateCast(skill, target, states.table.playerCemitery);
        wk.damage(skill.data('damage'), target, skill.data('damageType'));
        wk.addStun(target, stun);        
        target.on('turnstart.wkdot', this.dot).data('wk-dot', {
          duration: stun + dot, 
          source: source, 
          skill: skill
        });
      },
      dot: function(event, eventdata){
        var target = eventdata.target;
        var data = target.data('wk-dot');
        var source = data.source;
        var skill = data.skill;
        var dotduration = skill.data('dotduration'); 
        var duration = data.duration; 
        if(duration > 0){
          if(duration == dotduration) source.addBuff(target, skill.data('buff'), dotduration);
          if(duration <= dotduration) source.damage(skill.data('dot'), target, skill.data('damageType'));            
          data.duration--;
          target.data('wk-dot', data);
        } else {
          target.removeBuff('wk-stun')
          target.off('turnstart.wkdot');
          target.data('wk-dot', null);
        } 
      }
    },
    lifesteal: {
      activate: function(skill, source){
        var side = source.data('side');
        var team = $('.card.heroes.'+side);
        team.on('attack.wk', this.attack).data('wk-ls', skill);
        source.addBuff(team, skill.data('buff'));
        source.on('die.wk-ls', this.die);
        source.on('reborn.wk-ls', this.reborn);
      },
      attack: function(event, eventdata){ 
        var source = eventdata.source;
        var target = eventdata.target;        
        var damage = source.data('currentdamage');
        var skill = source.data('wk-ls');
        var bonus = skill.data('percentage') / 100;
        source.heal(damage * bonus);
      },
      die: function(event, eventdata){       
        var source = eventdata.target; 
        var side = source.data('side');
        var team = $('.card.heroes.'+side);        
        team.removeBuff('wk-lifesteal')
      },
      reborn: function(event, eventdata){
        var source = eventdata.target; 
        var skill = source.data('wk-ls');
        var side = source.data('side');
        var team = $('.card.heroes.'+side);
        source.addBuff(team, skill.data('buff'));
      }
    },
    crit: {
      activate: function(skill, source){
        source.addBuff(source, skill.data('buff'));
        source.on({
          'beforeattack.wk': this.attack,
          'afterattack.wk': this.afterattack,
        }).data('wk-crit', skill);        
      },
      attack: function(event, eventdata){
        var source = eventdata.source;
        var target = eventdata.target;
        var skill = source.data('wk-crit');
        var damage = source.data('currentdamage');
        var chance = skill.data('chance') / 100;
        var bonus = skill.data('percentage') / 100;
        var r = game.random();
        if(r < chance){
          damage *= bonus;
          source.data({
            'crit': true,
            'currentdamage': damage
          });
        }
      },
      afterattack: function(event, eventdata){
        var source = eventdata.source;
        source.data('currentdamage', source.data('damage'));
      }
    },
    ult: {
      activate: function(skill, source){
        source.on('die.wk-ult', this.die).data('wk-ult', skill);
        skill.on('discard', this.deactivate);
      },
      die: function(event, eventdata){       
        var wk = eventdata.target;      
        var spot = eventdata.spot;
        var skill = wk.data('wk-ult');
        $('#'+spot).addClass('cript');         
        wk.off('die.wk-ult');        
        wk.on('turnstart.wk-ult', skills.wk.ult.resurrect).data('wk-ult', {
          skill: skill,
          spot: spot,
          duration: skill.data('delay')
        });
        skill.discard();
      },
      resurrect: function(event, eventdata){
        var wk = eventdata.target;
        var data = wk.data('wk-ult');
        var skill = data.skill;
        var spot = data.spot;
        var duration = data.duration; 
        var side = wk.data('side');
        if(duration > 0){
          data.duration--;
          wk.data('wk-ult', data);
        } else {
          $('#'+spot).removeClass('cript');
          wk.reborn(spot).data('wk-ult', null);
          Map.inRange(spot, Map.getRange(skill.data('aoe')), function(neighbor){      
            var otherside = 'enemy';
            if(side == 'enemy') otherside = 'player';
            var card = $('.card.'+otherside, neighbor); 
            if(card.length){
              wk.addBuff(card, skill.data('buff'));  
              var speed = card.data('speed') - 1;
              card.data('currentspeed', speed);
              card.on('turnstart.wk-ult-buff', skills.wk.ult.removeBuff).data('wk-ult-buff', skill.data('duration'));
            }
          });
          game[side].buyCard();
          wk.off('turnstart.wk-ult');
        }
      },
      removeBuff: function(event, eventdata){
        var target = eventdata.target; 
        var duration = target.data('wk-ult-buff');
        if(duration > 0) {
          duration--;
          target.data('wk-ult-buff', duration);
        } else {
          var speed = target.data('currentspeed') + 1;
          target.data('currentspeed', speed);
          target.off('turnstart.wk-ult-buff').data('wk-ult-buff', null).removeBuff('wk-ult');
        }
      },
      deactivate: function(){
        source.off('die.wk-ult').data('wk-ult', null);
      }
    }    
  },
  

  ktol: {
    illuminate: {      
      cast: function(skill, source, target){},
      release: function(){}
    },
    illuminateult: {
      cast: function(skill, source, target){},
      release: function(){}
    },
    leak: {
      cast: function(skill, source, target){
      },
      movement: function(){},
      end: function(){}
    },
    mana: {
      cast: function(skill, source, target){
      },
    },
    ult: {
      cast: function(skill, source){
      },
      end: function(){}
    },
    blind: {
      cast: function(skill, source, target){
      },
      hit: function(){},
      end: function(){}
    },
    recall: {
      cast: function(skill, source, target){},
      damage: function(){},
      end: function(){}
    }
  },
  

  cm: {
    slow: {
      cast: function(skill, source, target){
        var spot = Map.getPosition(target); 
        if(game.status == 'turn') states.table.animateCast(skill, spot, states.table.playerCemitery);
        var side = source.data('side');        
        var otherside = (side == 'enemy') ? 'player': 'enemy';
        Map.inRange(spot, Map.getRange(skill.data('aoe')), function(neighbor){      
          var card = $('.card.'+otherside, neighbor); 
          if(card.length){
            source.damage(skill.data('damage'), card, skill.data('damageType'));              
            if(card.data('cm-slow-buff')){
              card.data('cm-slow-buff', skill.data('duration'));
            } else {
              card.data('cm-slow-buff', skill.data('duration'));
              source.addBuff(card, skill.data('buff'));                
              var speed = card.data('speed') - 1;
              card.data('currentspeed', speed);
              card.on('turnstart.cm-slow-buff', skills.cm.slow.removeBuff);
            }            
          }
        });
      },
      removeBuff: function(event, eventdata){
        var target = eventdata.target; 
        var duration = target.data('cm-slow-buff');
        if(duration > 0) {
          duration--;
          target.data('cm-slow-buff', duration);
        } else {
          var speed = target.data('currentspeed') + 1;
          target.data('currentspeed', speed);
          target.off('turnstart.cm-slow-buff').data('cm-slow-buff', null).removeBuff('cm-slow');
        }
      }
    },
    aura: {
      activate: function(skill, source){
        var side = source.data('side');
        game[side].cardsPerTurn++;
        source.on('die.cm-aura');        
        source.on('reborn.cm-aura');        
      },
      die: function(event, eventdata){   
        var cm = eventdata.target;
        var side = cm.data('side');  
        game[side].cardsPerTurn--;
      },
      reborn: function(event, eventdata){
        var cm = eventdata.target;
        var side = cm.data('side');   
        game[side].cardsPerTurn++;
      }
    },
    freeze: {
      cast: function(skill, source, target){
      },
      dot: function(){},
      end: function(){}
    },
    ult: {
      cast: function(skill, source){
      },
      dot: function(){},
      end: function(){}
    }    
  },
  

  am: {
    burn: {
      activate: function(skill, source){},
      damage: function(){}
    },
    passive: {
      activate: function(skill, source){},
      damage: function(){}
    },
    blink: {
      cast: function(skill, source, target){
        source.css({opacity: 0});
        skill.css({opacity: 0});
        setTimeout(function(){
          this.source.place(this.target).css({opacity: 1});
          this.skill.discard();
          source.select();
        }.bind({skill: skill, source: source, target: target}), 500);        
      }
    },
    ult: {
      cast: function(skill, source, target){}
    }    
  },


  pud: {
    hook: {
      cast: function(skill, source, target){}
    },
    rot: {
      cast: function(skill, source){}
    },
    passive: {
      activate: function(skill, source){},
      damage: function(){},
      die: function(){}
    },
    ult: {
      cast: function(skill, source, target){},
      dot: function(){},
      end: function(){}
    }    
  },


  nyx: {
    stun: {
      cast: function(skill, source, target){},
      end: function(){}
    },
    burn: {
      cast: function(skill, source, target){},
      damage: function(){} 
    },
    spike: {
      cast: function(skill, source){},
      damage: function(){}
    },
    ult: {
      cast: function(skill, source){},
      damage: function(){}
    }    
  },

  ld: {
    summon: {
      cast: function(skill, source, target){}
    },
    rabid: {
      cast: function(skill, source){},
      end: function(){}
    },
    passive: {
      activate: function(skill, source){}
    },
    ult: {
      cast: function(skill, source){}  
    },
    cry: {
      cast: function(skill, source){},
      end: function(){}
    },
    transform: {
      cast: function(skill, source){}      
    }
  }

};